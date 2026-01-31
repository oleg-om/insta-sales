import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Instagram OAuth - Initiate (via Facebook)
router.get('/instagram', authMiddleware, (req: AuthRequest, res) => {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  const state = req.userId?.toString(); // Use userId as state for security

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Instagram OAuth not configured' });
  }

  // Facebook Login with Instagram Graph API permissions
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=instagram_basic,pages_show_list,business_management&response_type=code`;

  res.json({ authUrl });
});

// Instagram OAuth - Callback
router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    const userId = parseInt(state as string);

    // Exchange code for access token (Facebook Graph API)
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          client_id: process.env.INSTAGRAM_CLIENT_ID!,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
          code: code as string,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user's Facebook pages
    const pagesResponse = await axios.get(
      `https://graph.facebook.com/v19.0/me/accounts`,
      {
        params: {
          access_token,
          fields: 'instagram_business_account,name',
        },
      }
    );

    // Find Instagram Business Account
    let instagramAccountId = null;
    let username = null;
    let user_id = null;

    if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
      for (const page of pagesResponse.data.data) {
        if (page.instagram_business_account) {
          instagramAccountId = page.instagram_business_account.id;
          
          // Get Instagram username
          const igProfileResponse = await axios.get(
            `https://graph.facebook.com/v19.0/${instagramAccountId}`,
            {
              params: {
                fields: 'username,id',
                access_token,
              },
            }
          );
          
          username = igProfileResponse.data.username;
          user_id = igProfileResponse.data.id;
          break;
        }
      }
    }

    if (!instagramAccountId || !username) {
      console.error('No Instagram Business Account found');
      return res.redirect(
        `http://localhost:5173/dashboard?error=no_instagram_business_account`
      );
    }

    // Save or update Instagram account
    await query(
      `INSERT INTO instagram_accounts (user_id, instagram_user_id, username, access_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (instagram_user_id) 
       DO UPDATE SET username = $3, access_token = $4, updated_at = CURRENT_TIMESTAMP`,
      [userId, user_id.toString(), username, access_token]
    );

    // Redirect to frontend dashboard
    res.redirect(`http://localhost:5173/dashboard?instagram_connected=true`);
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.redirect(`http://localhost:5173/dashboard?error=instagram_auth_failed`);
  }
});

// Get Instagram account info
router.get('/instagram/account', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT instagram_user_id, username, created_at FROM instagram_accounts WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      account: {
        instagramUserId: result.rows[0].instagram_user_id,
        username: result.rows[0].username,
        connectedAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Get Instagram account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
