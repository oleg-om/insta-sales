# Insta Sales

Full-stack application with email/password authentication and Instagram OAuth integration.

**📖 Быстрый старт:** [QUICKSTART.md](./QUICKSTART.md) - Инструкция для запуска за 5 минут

## Tech Stack

- **Frontend**: React, TypeScript, Vite, shadcn/ui, Radix UI, Tailwind CSS, i18next
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose
- **Internationalization**: English & Russian support

## Features

- ✅ User registration and login with email/password
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Instagram OAuth integration
- ✅ Modern UI with shadcn/ui components
- ✅ Responsive design
- ✅ Docker containerization
- ✅ **Multilingual support (English & Russian)** 🌐

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

**Important:** Instagram now requires Facebook Login with Instagram Business Account.

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a Facebook App (Business type)
3. Add "Facebook Login" product
4. Configure Valid OAuth Redirect URIs: `http://localhost:3001/api/auth/instagram/callback`
5. Copy App ID and App Secret to `.env`
6. Convert your Instagram to Business Account and link to Facebook Page

**Detailed instructions:** See [INSTAGRAM_SETUP.md](./INSTAGRAM_SETUP.md)

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

### Development

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

### Production

#### Локальный деплой на сервер:

```bash
# Deploy to production
./scripts/deploy.sh

# Check status
./scripts/status.sh

# View logs
./scripts/logs.sh

# Backup database
./scripts/backup.sh
```

#### Автоматический деплой через GitHub Actions:

**Вариант 1: Деплой через SSH (БЕЗ Docker Hub) - РЕКОМЕНДУЕТСЯ**
```bash
# Push в main ветку запускает автоматический деплой
git push origin main
```

**Вариант 2: Деплой через Docker Hub**
- Требует Docker Hub аккаунт
- Запускается вручную через GitHub Actions

**Документация:**
- 🎯 [DEPLOY_OPTIONS.md](./DEPLOY_OPTIONS.md) - Сравнение вариантов деплоя
- 🚀 [SSH_QUICKSTART.md](./SSH_QUICKSTART.md) - Быстрая настройка SSH (5 минут)
- 📖 [SSH_SETUP.md](./SSH_SETUP.md) - Детальная настройка SSH
- 📋 [DEPLOYMENT.md](./DEPLOYMENT.md) - Полное руководство по деплою
- 🔐 [.github/SECRETS.md](./.github/SECRETS.md) - Настройка GitHub Secrets
- 🌐 [DOMAIN_ENV.md](./DOMAIN_ENV.md) - **Домен через .env (НОВОЕ!)** ⭐
- 🌐 [DOMAIN_QUICKFIX.md](./DOMAIN_QUICKFIX.md) - Быстрое решение проблем с доменом
- 🌐 [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) - Полная настройка домена и SSL
- 🔧 [ENV_SETUP.md](./ENV_SETUP.md) - Настройка переменных окружения

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

## Internationalization (i18n)

The application supports multiple languages:

- 🇬🇧 **English** (default)
- 🇷🇺 **Русский** (Russian)

### Language Switching

Users can switch languages using the language switcher button (🌐) available on:
- Login page (top right)
- Registration page (top right)
- Dashboard (navigation bar)

The selected language is automatically saved to localStorage.

### For Developers

See [INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md) for:
- Adding new translations
- Adding new languages
- Translation file structure
- Best practices

**Translation files location:**
- `frontend/src/i18n/locales/en.json` - English
- `frontend/src/i18n/locales/ru.json` - Russian

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
