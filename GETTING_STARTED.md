# Getting Started with InstaSales

Your application has been created and is ready to use! 🎉

## What You Have

✅ **Frontend (React + Radix UI)**
- Modern UI with Tailwind CSS
- Login and Registration pages
- Dashboard with social account management
- Toast notifications
- Protected routes

✅ **Backend (Node.js + Express)**
- RESTful API with TypeScript
- JWT authentication
- Instagram OAuth integration
- Error handling middleware

✅ **Database (PostgreSQL + Prisma)**
- User management
- Social account connections
- Type-safe database access

## Quick Start

### 1. Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb instasales
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb instasales
```

### 2. Run Database Migration

```bash
cd server
npx prisma migrate dev --name init
cd ..
```

### 3. Start the Application

```bash
npm run dev
```

This will start:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

### 4. Test the Application

1. Open http://localhost:5173
2. Click "Create one" to register
3. Enter your email and password
4. You'll be redirected to the dashboard

## Instagram OAuth Setup (Optional)

To enable Instagram connection, you need to:

1. **Create a Facebook App**
   - Go to https://developers.facebook.com/
   - Create a new app (Consumer type)

2. **Add Instagram Basic Display**
   - In your app, add "Instagram Basic Display" product
   - Configure OAuth Redirect URI: `http://localhost:3001/auth/instagram/callback`

3. **Get Credentials**
   - Go to Basic Settings
   - Copy App ID and App Secret

4. **Update Environment**
   - Edit `.env` file
   - Add your Instagram credentials:
   ```
   INSTAGRAM_CLIENT_ID=your-app-id
   INSTAGRAM_CLIENT_SECRET=your-app-secret
   ```

5. **Add Test Users**
   - In Instagram Basic Display settings
   - Add Instagram test users
   - Login with a test user to connect

## Project Commands

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev

# Start backend only
npm run dev:server

# Start frontend only
npm run dev:client

# Build for production
npm run build

# Run Prisma Studio (database GUI)
cd server && npm run db:studio
```

## Project Structure

```
insta-sales/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/ui/  # Radix UI components
│   │   ├── contexts/       # Auth context
│   │   ├── lib/            # API client & utilities
│   │   ├── pages/          # Login, Register, Dashboard
│   │   └── App.tsx
│   └── package.json
│
├── server/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   └── index.ts
│   └── package.json
│
├── .env                    # Environment variables
└── package.json            # Root workspace
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `GET /auth/me` - Get current user (protected)

### Social Media
- `GET /social/instagram/authorize` - Get Instagram OAuth URL
- `GET /social/instagram/callback` - OAuth callback
- `GET /social/accounts` - List connected accounts
- `DELETE /social/instagram` - Disconnect Instagram

## Environment Variables

All environment variables are in `.env` file:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Backend port (default: 3001)
- `FRONTEND_URL` - Frontend URL

**Optional (for Instagram):**
- `INSTAGRAM_CLIENT_ID` - From Facebook Developers
- `INSTAGRAM_CLIENT_SECRET` - From Facebook Developers
- `INSTAGRAM_REDIRECT_URI` - OAuth callback URL

## Common Issues

### "Cannot connect to database"
- Start PostgreSQL: `brew services start postgresql@14`
- Create database: `createdb instasales`
- Check DATABASE_URL in `.env`

### "Port already in use"
- Change PORT in `.env` (backend)
- Change port in `client/vite.config.ts` (frontend)

### Instagram OAuth not working
- Verify redirect URI matches exactly
- Add test users in Facebook Developers
- Login with test Instagram account
- Check credentials in `.env`

## Next Steps

Now you can:
1. ✨ Customize the UI design
2. 📊 Add Instagram analytics and insights
3. 📅 Implement post scheduling
4. 🔗 Add more social networks (Facebook, Twitter, TikTok)
5. 👥 Add team collaboration features
6. 📈 Build reporting dashboards

## Need Help?

- Check `QUICKSTART.md` for quick reference
- See `SETUP.md` for detailed setup instructions
- Read `README.md` for project overview

Happy coding! 🚀
