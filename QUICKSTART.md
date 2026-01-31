# Quick Start Guide

## Automated Setup (Recommended)

Run the automated setup script:

```bash
./setup.sh
```

This will:
1. Create `.env` file with default configuration
2. Install all dependencies
3. Start PostgreSQL database
4. Run database migrations

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Create `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/insta_sales
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=insta_sales
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/auth/instagram/callback
VITE_API_URL=http://localhost:3001
```

### 3. Start Database

```bash
docker-compose up -d postgres
```

### 4. Run Migrations

```bash
cd backend
npm run migrate
cd ..
```

### 5. Start Development Servers

```bash
npm run dev
```

## Instagram OAuth Setup

1. Visit [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Instagram Basic Display" product
4. Configure OAuth Redirect URI: `http://localhost:3001/api/auth/instagram/callback`
5. Copy Client ID and Client Secret to `.env`
6. Add test users in the app dashboard

## Testing the Application

1. Open http://localhost:5173
2. Click "Register" to create an account
3. Login with your credentials
4. Click "Connect Instagram Account" in the dashboard
5. Authorize the app
6. See your Instagram username displayed

## Common Issues

**Port already in use:**
```bash
# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Database connection failed:**
```bash
docker-compose restart postgres
```

**Instagram OAuth not working:**
- Check that redirect URI matches exactly
- Ensure app is in Development Mode
- Add your Instagram account as a test user
