# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                    http://localhost:5173                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages:                                              │   │
│  │  - LoginPage      - RegisterPage                     │   │
│  │  - DashboardPage                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components:                                         │   │
│  │  - ProtectedRoute                                    │   │
│  │  - shadcn/ui components (Button, Input, Card, etc)  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Context:                                            │   │
│  │  - AuthContext (user state, auth methods)           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Client:                                         │   │
│  │  - axios with interceptors                           │   │
│  │  - JWT token management                              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API Calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│                Backend API (Express)                         │
│                 http://localhost:3001                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes:                                             │   │
│  │  POST   /api/auth/register                           │   │
│  │  POST   /api/auth/login                              │   │
│  │  GET    /api/auth/me              [Protected]       │   │
│  │  GET    /api/auth/instagram       [Protected]       │   │
│  │  GET    /api/auth/instagram/callback                │   │
│  │  GET    /api/auth/instagram/account [Protected]     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware:                                         │   │
│  │  - CORS                                              │   │
│  │  - JSON body parser                                  │   │
│  │  - JWT authentication                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Utils:                                              │   │
│  │  - Password hashing (bcrypt)                         │   │
│  │  - JWT generation/verification                       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                   localhost:5432                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  - users                                             │   │
│  │    * id, email, password_hash, created_at           │   │
│  │  - instagram_accounts                                │   │
│  │    * id, user_id, instagram_user_id, username       │   │
│  │    * access_token, created_at                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │  Instagram API  │
                         │  OAuth 2.0      │
                         └─────────────────┘
```

## Authentication Flow

### Email/Password Authentication

```
User                    Frontend                Backend              Database
  │                        │                       │                    │
  │  1. Enter credentials  │                       │                    │
  ├───────────────────────>│                       │                    │
  │                        │  2. POST /api/auth/   │                    │
  │                        │     login/register    │                    │
  │                        ├──────────────────────>│                    │
  │                        │                       │  3. Hash password  │
  │                        │                       │  4. Query/Insert   │
  │                        │                       ├───────────────────>│
  │                        │                       │<───────────────────┤
  │                        │                       │  5. User data      │
  │                        │                       │  6. Generate JWT   │
  │                        │  7. Return token      │                    │
  │                        │<──────────────────────┤                    │
  │  8. Store in localStorage                      │                    │
  │<───────────────────────┤                       │                    │
  │  9. Redirect to dashboard                      │                    │
  │                        │                       │                    │
```

### Instagram OAuth Flow

```
User              Frontend           Backend           Instagram API      Database
  │                  │                  │                    │               │
  │ 1. Click Connect │                  │                    │               │
  ├─────────────────>│                  │                    │               │
  │                  │ 2. GET /api/auth/instagram            │               │
  │                  ├─────────────────>│                    │               │
  │                  │                  │ 3. Generate OAuth URL              │
  │                  │<─────────────────┤                    │               │
  │ 4. Redirect to Instagram            │                    │               │
  ├─────────────────────────────────────────────────────────>│               │
  │                  │                  │                    │               │
  │ 5. User authorizes app              │                    │               │
  │                  │                  │                    │               │
  │ 6. Redirect with code               │                    │               │
  │<────────────────────────────────────────────────────────┤               │
  │                  │                  │                    │               │
  │ 7. GET /api/auth/instagram/callback │                    │               │
  ├─────────────────────────────────────>│                    │               │
  │                  │                  │ 8. Exchange code   │               │
  │                  │                  ├───────────────────>│               │
  │                  │                  │<───────────────────┤               │
  │                  │                  │ 9. Access token    │               │
  │                  │                  │ 10. Get user info  │               │
  │                  │                  ├───────────────────>│               │
  │                  │                  │<───────────────────┤               │
  │                  │                  │ 11. Username       │               │
  │                  │                  │ 12. Save to DB     │               │
  │                  │                  ├───────────────────────────────────>│
  │                  │                  │ 13. Redirect to dashboard          │
  │<─────────────────────────────────────┤                    │               │
  │                  │                  │                    │               │
```

## Technology Stack Details

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Backend
- **Node.js 20**: Runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Relational database
- **pg**: PostgreSQL client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT generation/verification
- **zod**: Schema validation
- **axios**: HTTP client for Instagram API

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Frontend serving in production

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password length validation

2. **JWT Authentication**
   - Secure token generation
   - 7-day expiration
   - Token stored in localStorage
   - Automatic token injection in requests

3. **Protected Routes**
   - Frontend route protection
   - Backend middleware authentication
   - Automatic redirect on unauthorized access

4. **OAuth Security**
   - State parameter for CSRF protection
   - Secure token exchange
   - Token stored server-side only

5. **API Security**
   - CORS configuration
   - Request validation with Zod
   - SQL injection prevention with parameterized queries

## Database Schema

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### instagram_accounts
```sql
CREATE TABLE instagram_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  instagram_user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment Considerations

### Development
- Hot reload for both frontend and backend
- Source maps for debugging
- Detailed error messages

### Production
- Minified and optimized builds
- Nginx for static file serving
- Environment-specific configurations
- Health check endpoints
- Container restart policies

## Future Enhancements

- [ ] Refresh token rotation
- [ ] Rate limiting
- [ ] Request logging
- [ ] Error tracking (Sentry)
- [ ] Instagram post management
- [ ] Analytics dashboard
- [ ] Multi-account support
- [ ] Webhook integration
- [ ] Email verification
- [ ] Password reset flow
