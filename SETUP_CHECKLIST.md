# Setup Checklist

Follow this checklist to get your Insta Sales application up and running.

## ☐ Prerequisites

- [ ] Node.js 20+ installed
- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## ☐ Initial Setup

- [ ] Clone/navigate to project directory
- [ ] Run automated setup: `./setup.sh`
  - Or manually install: `npm install && cd backend && npm install && cd ../frontend && npm install && cd ..`
- [ ] Verify `.env` file was created in root directory

## ☐ Instagram App Configuration

- [ ] Go to [Meta for Developers](https://developers.facebook.com/)
- [ ] Create a new app (or select existing)
- [ ] Add "Instagram Basic Display" product to your app
- [ ] Configure OAuth settings:
  - [ ] Valid OAuth Redirect URIs: `http://localhost:3001/api/auth/instagram/callback`
  - [ ] Deauthorize Callback URL: `http://localhost:3001/api/auth/instagram/deauthorize`
  - [ ] Data Deletion Request URL: `http://localhost:3001/api/auth/instagram/delete`
- [ ] Copy your Instagram App ID (Client ID)
- [ ] Copy your Instagram App Secret (Client Secret)
- [ ] Add test users:
  - [ ] Go to "Roles" > "Instagram Testers"
  - [ ] Add your Instagram account
  - [ ] Accept invitation on Instagram app

## ☐ Environment Configuration

Edit `.env` file in root directory:

- [ ] Set `INSTAGRAM_CLIENT_ID` to your Instagram App ID
- [ ] Set `INSTAGRAM_CLIENT_SECRET` to your Instagram App Secret
- [ ] Verify `INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/auth/instagram/callback`
- [ ] Change `JWT_SECRET` to a secure random string (for production)
- [ ] Verify database settings (default should work for local development)

## ☐ Database Setup

- [ ] Start PostgreSQL: `docker-compose up -d postgres`
- [ ] Wait 5 seconds for database to be ready
- [ ] Run migrations: `cd backend && npm run migrate && cd ..`
- [ ] Verify migrations completed successfully (should see "✅ Database tables created successfully")

## ☐ Start Development Servers

Option 1 - All at once:
- [ ] Run: `npm run dev`
- [ ] Wait for both servers to start

Option 2 - Separately:
- [ ] Terminal 1: `npm run dev:backend` (should start on port 3001)
- [ ] Terminal 2: `npm run dev:frontend` (should start on port 5173)

## ☐ Test the Application

### Test Registration and Login
- [ ] Open browser to http://localhost:5173
- [ ] Click "Register"
- [ ] Create account with email and password
- [ ] Verify redirect to dashboard
- [ ] Verify email is displayed in "Account Information" card
- [ ] Click "Logout"
- [ ] Click "Login"
- [ ] Login with same credentials
- [ ] Verify redirect to dashboard

### Test Instagram Connection
- [ ] In dashboard, click "Connect Instagram Account"
- [ ] Verify redirect to Instagram authorization page
- [ ] Login to Instagram (if needed)
- [ ] Click "Authorize" to allow access
- [ ] Verify redirect back to dashboard
- [ ] Verify success toast notification
- [ ] Verify Instagram username is displayed in "Instagram Connection" card
- [ ] Verify green "Connected" badge is shown

## ☐ Verify Backend API

- [ ] Open http://localhost:3001/health in browser
- [ ] Should see: `{"status":"ok"}`

Test API endpoints with curl or Postman:

```bash
# Health check
curl http://localhost:3001/health

# Register (should return user and token)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login (should return user and token)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## ☐ Docker Deployment (Optional)

- [ ] Build images: `docker-compose build`
- [ ] Start all services: `docker-compose up -d`
- [ ] Check logs: `docker-compose logs -f`
- [ ] Test frontend: http://localhost:5173
- [ ] Test backend: http://localhost:3001/health
- [ ] Stop services: `docker-compose down`

## ☐ Troubleshooting

### Port Already in Use

**Note:** This project uses port **5433** for PostgreSQL to avoid conflicts with local PostgreSQL installations.

```bash
# Check what's using the ports
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :5433  # PostgreSQL (Docker)

# Kill process if needed
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d postgres
cd backend && npm run migrate && cd ..
```

### Instagram OAuth Issues
- [ ] Verify redirect URI matches exactly in Instagram app settings
- [ ] Ensure Client ID and Secret are correct in `.env`
- [ ] Check that your Instagram account is added as a test user
- [ ] Accept test user invitation on Instagram
- [ ] Try in incognito/private browser window
- [ ] Check browser console for errors

### Frontend Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Issues
```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## ☐ Production Deployment

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update `INSTAGRAM_REDIRECT_URI` to production URL
- [ ] Update Instagram app settings with production redirect URI
- [ ] Use HTTPS for all URLs
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up proper database backups
- [ ] Configure monitoring and logging
- [ ] Review security settings

## ✅ Success Criteria

You've successfully set up the application when:

- ✅ You can register a new account
- ✅ You can login with email/password
- ✅ You can see your email in the dashboard
- ✅ You can click "Connect Instagram Account"
- ✅ You can authorize the Instagram app
- ✅ You can see your Instagram username in the dashboard
- ✅ You can logout and login again
- ✅ Your Instagram connection persists after logout/login

## 📚 Additional Resources

- [README.md](./README.md) - Main documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs: `docker-compose logs` or terminal output
3. Verify all environment variables are set correctly
4. Ensure all services are running
5. Check Instagram app configuration

---

**Happy coding! 🚀**
