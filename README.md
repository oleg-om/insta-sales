# InstaSales

A modern social media management platform with Instagram integration.

## ✅ Status: Ready to Use!

The application is fully set up and ready to run. See [STATUS.md](STATUS.md) for complete setup details.

## 🚀 Quick Start

```bash
# Start the application
npm run dev
```

Then open http://localhost:5173 in your browser.

**That's it!** The database is configured, migrations are applied, and you're ready to go.

## Features

- ✅ User registration and authentication (email/password)
- ✅ Instagram OAuth integration (needs configuration)
- ✅ Modern UI with Radix UI components
- ✅ PostgreSQL database with Prisma ORM
- ✅ Secure JWT authentication
- ✅ Toast notifications
- ✅ Protected routes

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (fast build tool)
- Radix UI (accessible components)
- Tailwind CSS (utility-first CSS)
- React Router (navigation)
- Axios (HTTP client)

### Backend
- Node.js with TypeScript
- Express (web framework)
- PostgreSQL (database)
- Prisma ORM (type-safe database access)
- JWT authentication
- bcrypt (password hashing)
- Zod (input validation)

## What's Already Set Up

✅ PostgreSQL database created (`instasales`)
✅ Database schema migrated
✅ All dependencies installed (343 packages)
✅ Environment variables configured
✅ JWT secret generated
✅ Development servers ready

## First Steps

1. **Start the app:** `npm run dev`
2. **Open browser:** http://localhost:5173
3. **Create account:** Click "Create one" and register
4. **You're in!** Explore the dashboard

## Optional: Instagram OAuth Setup

To enable Instagram connection:

1. Go to https://developers.facebook.com/
2. Create a new app (Consumer type)
3. Add "Instagram Basic Display" product
4. Configure OAuth redirect: `http://localhost:3001/auth/instagram/callback`
5. Update `.env` with your credentials:
   ```
   INSTAGRAM_CLIENT_ID=your-app-id
   INSTAGRAM_CLIENT_SECRET=your-app-secret
   ```
6. Restart the app

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed Instagram setup instructions.

## Available Commands

```bash
npm run dev          # Start both frontend and backend
npm run dev:server   # Start backend only
npm run dev:client   # Start frontend only
npm run build        # Build for production
```

## Project Structure

```
insta-sales/
├── client/                 # React frontend (http://localhost:5173)
│   ├── src/
│   │   ├── components/ui/  # Radix UI components
│   │   ├── contexts/       # Auth context
│   │   ├── lib/            # API client & utils
│   │   ├── pages/          # Login, Register, Dashboard
│   │   └── App.tsx
│   └── package.json
│
├── server/                 # Express backend (http://localhost:3001)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Applied migrations
│   ├── src/
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   └── index.ts
│   └── package.json
│
├── .env                    # Environment variables
├── package.json            # Workspace root
└── STATUS.md              # Setup status and details
```

## Documentation

- **[STATUS.md](STATUS.md)** - Complete setup status and features
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Detailed getting started guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference
- **[SETUP.md](SETUP.md)** - Manual setup instructions
- **[check-setup.sh](check-setup.sh)** - Verify setup script

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (protected)

### Social Accounts
- `GET /social/instagram/authorize` - Get Instagram OAuth URL (protected)
- `GET /social/instagram/callback` - OAuth callback
- `GET /social/accounts` - List connected accounts (protected)
- `DELETE /social/instagram` - Disconnect Instagram (protected)

## Troubleshooting

### Database connection error
```bash
# Start PostgreSQL
brew services start postgresql@14
```

### Port already in use
Edit `.env` and change `PORT=3001` to another port.

### Check setup status
```bash
./check-setup.sh
```

## Next Steps

Now that the foundation is ready, you can add:
- Instagram post scheduling
- Analytics and insights
- Content management
- More social networks (Facebook, Twitter, TikTok)
- Team collaboration features

---

**Need help?** Check the documentation files or run `./check-setup.sh` to verify your setup.

**Ready to start?** Run `npm run dev` and visit http://localhost:5173
