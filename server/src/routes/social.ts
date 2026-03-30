import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

// Instagram API response types
interface InstagramTokenResponse {
  access_token: string;
  user_id: number;
  error_message?: string;
}

interface InstagramLongLivedTokenResponse {
  access_token?: string;
  expires_in?: number;
}

interface InstagramProfileResponse {
  id: string;
  username: string;
}

router.get('/instagram/authorize', authenticateToken, (req: AuthRequest, res) => {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  const state = req.userId;

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`;

  res.json({ url: authUrl });
});

router.get('/instagram/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=auth_failed`);
  }

  try {
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
        code: code as string,
      }),
    });

    const tokenData = await tokenResponse.json() as InstagramTokenResponse;

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_message || 'Failed to get access token');
    }

    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
    );

    const longLivedData = await longLivedTokenResponse.json() as InstagramLongLivedTokenResponse;

    const accessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in;

    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );
    const profileData = await profileResponse.json() as InstagramProfileResponse;

    await prisma.socialAccount.upsert({
      where: {
        provider_providerId: {
          provider: 'instagram',
          providerId: profileData.id,
        },
      },
      update: {
        accessToken,
        username: profileData.username,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
      create: {
        userId: userId as string,
        provider: 'instagram',
        providerId: profileData.id,
        username: profileData.username,
        accessToken,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?success=instagram_connected`);
  } catch (error) {
    console.error('Instagram OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=auth_failed`);
  }
});

router.delete('/instagram', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    await prisma.socialAccount.deleteMany({
      where: {
        userId: req.userId,
        provider: 'instagram',
      },
    });

    res.json({ message: 'Instagram account disconnected' });
  } catch (error) {
    next(error);
  }
});

router.get('/accounts', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        provider: true,
        username: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

export default router;
