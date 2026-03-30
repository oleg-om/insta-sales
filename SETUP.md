# Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running on your system.

### Create the database:

```bash
createdb instasales
```

Or using psql:

```sql
CREATE DATABASE instasales;
```

## Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/instasales
JWT_SECRET=your-random-secret-key-here
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

## Step 4: Set Up Instagram OAuth

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in your app details
5. Go to "Add Products" and add "Instagram Basic Display"
6. In Instagram Basic Display settings:
   - Add OAuth Redirect URIs: `http://localhost:3001/auth/instagram/callback`
   - Add Deauthorize Callback URL: `http://localhost:3001/auth/instagram/deauthorize`
   - Add Data Deletion Request URL: `http://localhost:3001/auth/instagram/delete`
7. Go to "Basic Settings" to get your App ID (Client ID) and App Secret (Client Secret)
8. Add test users in Instagram Basic Display settings

## Step 5: Run Database Migrations

```bash
cd server
npx prisma migrate dev --name init
```

## Step 6: Start the Development Servers

From the root directory:

```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 5173).

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## Step 7: Access the Application

Open your browser and go to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Troubleshooting

### Database Connection Issues

If you get a database connection error:
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Verify database credentials

### Instagram OAuth Issues

If Instagram connection fails:
1. Verify your redirect URI matches exactly: `http://localhost:3001/auth/instagram/callback`
2. Make sure you've added test users in the Instagram Basic Display settings
3. Check that your Client ID and Secret are correct in `.env`
4. Make sure you're logged into Instagram with a test user account

### Port Already in Use

If ports 3001 or 5173 are already in use:
1. Change PORT in `.env` for backend
2. Change port in `client/vite.config.ts` for frontend
3. Update FRONTEND_URL in `.env` accordingly
