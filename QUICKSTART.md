# Quick Start Guide

## What's Been Created

A full-stack application with:
- ✅ React frontend with Radix UI components
- ✅ Express backend with TypeScript
- ✅ PostgreSQL database with Prisma ORM
- ✅ Email/password authentication
- ✅ Instagram OAuth integration
- ✅ Modern, responsive UI with Tailwind CSS

## Project Structure

```
insta-sales/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components (Radix UI)
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── lib/         # Utilities (API client, utils)
│   │   ├── pages/       # Page components
│   │   └── App.tsx
│   └── package.json
├── server/              # Express backend
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── middleware/  # Auth & error handling
│   │   ├── routes/      # API routes
│   │   └── index.ts
│   └── package.json
└── package.json         # Workspace root
```

## Next Steps

### 1. Set Up PostgreSQL

Make sure PostgreSQL is installed and running:

```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb instasales
```

### 2. Configure Instagram OAuth (Optional for now)

You can skip this for initial testing and set it up later:

1. Go to https://developers.facebook.com/
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth redirect: `http://localhost:3001/auth/instagram/callback`
5. Update `.env` with your credentials

### 3. Set Up Database

```bash
cd server
npx prisma migrate dev --name init
```

### 4. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Testing the Application

### 1. Register a New Account
- Go to http://localhost:5173
- Click "Create one" to register
- Enter email and password
- You'll be redirected to the dashboard

### 2. Connect Instagram (after OAuth setup)
- Click "Connect" button on Instagram card
- Authorize with Instagram
- You'll be redirected back with the account connected

### 3. Test Authentication
- Logout and login again
- Your Instagram connection should persist

## Environment Variables

### Required (already set in `.env`)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Backend server port (3001)
- `FRONTEND_URL` - Frontend URL (http://localhost:5173)

### Optional (for Instagram OAuth)
- `INSTAGRAM_CLIENT_ID` - From Facebook Developers
- `INSTAGRAM_CLIENT_SECRET` - From Facebook Developers
- `INSTAGRAM_REDIRECT_URI` - OAuth callback URL

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (requires auth)

### Social Accounts
- `GET /social/instagram/authorize` - Get Instagram OAuth URL
- `GET /social/instagram/callback` - OAuth callback handler
- `GET /social/accounts` - Get connected accounts
- `DELETE /social/instagram` - Disconnect Instagram

## Troubleshooting

### "Cannot connect to database"
1. Make sure PostgreSQL is running: `brew services list`
2. Check DATABASE_URL in `.env`
3. Create database: `createdb instasales`

### "Module not found"
```bash
npm install
```

### "Port already in use"
Change the port in `.env` (for backend) or `client/vite.config.ts` (for frontend)

## What's Next?

Now that the basic structure is in place, you can:
1. Add more social media integrations (Facebook, Twitter, etc.)
2. Implement post scheduling features
3. Add analytics and insights
4. Build content management features
5. Add team collaboration features

See `SETUP.md` for detailed setup instructions and `README.md` for more information.
