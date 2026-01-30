# Insta Sales

Full-stack application with email/password authentication and Instagram OAuth integration.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose

## Features

- ✅ User registration and login with email/password
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Instagram OAuth integration
- ✅ Modern UI with shadcn/ui components
- ✅ Responsive design
- ✅ Docker containerization

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Instagram App credentials (for OAuth)

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database (using port 5433 to avoid conflicts with local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/insta_sales
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=insta_sales

# Backend
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/auth/instagram/callback

# Frontend
VITE_API_URL=http://localhost:3001
```

### 3. Setup Instagram App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Instagram Basic Display product
4. Configure OAuth Redirect URIs: `http://localhost:3001/api/auth/instagram/callback`
5. Copy Client ID and Client Secret to `.env`

### 4. Start Database

```bash
docker-compose up -d postgres
```

### 5. Run Database Migrations

```bash
cd backend
npm run migrate
cd ..
```

### 6. Start Development Servers

Option 1: Start all services together
```bash
npm run dev
```

Option 2: Start services separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Docker Deployment

Build and run all services with Docker:

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all containers
docker-compose down
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
insta-sales/
├── backend/
│   ├── src/
│   │   ├── db/           # Database configuration and migrations
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── ui/       # shadcn/ui components
│   │   ├── contexts/     # React contexts
│   │   ├── lib/          # Utilities and API client
│   │   ├── pages/        # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Instagram OAuth
- `GET /api/auth/instagram` - Get Instagram OAuth URL (protected)
- `GET /api/auth/instagram/callback` - Instagram OAuth callback
- `GET /api/auth/instagram/account` - Get connected Instagram account (protected)

## Development

### Backend

```bash
cd backend
npm run dev        # Start development server
npm run build      # Build for production
npm run migrate    # Run database migrations
```

### Frontend

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Database Schema

### users
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `created_at` - Timestamp
- `updated_at` - Timestamp

### instagram_accounts
- `id` - Primary key
- `user_id` - Foreign key to users
- `instagram_user_id` - Instagram user ID
- `username` - Instagram username
- `access_token` - OAuth access token
- `token_expires_at` - Token expiration
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Keep Instagram credentials secure
- Never commit `.env` file
- Use environment-specific configurations

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL
```

### Instagram OAuth Issues
- Verify redirect URI matches exactly in Instagram app settings
- Check that Client ID and Secret are correct
- Ensure app is in development mode with test users added

## License

MIT
