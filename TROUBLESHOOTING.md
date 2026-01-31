# Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Error: "role postgres does not exist"

**Symptom:**
```
error: role "postgres" does not exist
```

**Cause:** You have a local PostgreSQL instance running on port 5432, and the application is connecting to it instead of the Docker container.

**Solution:**
This project uses port **5433** for the Docker PostgreSQL container to avoid conflicts. Make sure your `.env` file has:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/insta_sales
```

And verify the Docker container is running on port 5433:
```bash
docker ps | grep postgres
# Should show: 0.0.0.0:5433->5432/tcp
```

If you want to use port 5432 instead, you need to stop your local PostgreSQL:
```bash
# macOS with Homebrew
brew services stop postgresql

# Linux with systemd
sudo systemctl stop postgresql
```

### 2. Port Already in Use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
Find and kill the process using the port:
```bash
# Find the process
lsof -i :3001

# Kill it
kill -9 <PID>
```

### 3. Docker Container Won't Start

**Symptom:**
```
Error response from daemon: driver failed programming external connectivity
```

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart Docker Desktop
# Then start again
docker-compose up -d postgres
```

### 4. Migrations Fail

**Symptom:**
```
Migration failed: connection refused
```

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Wait for it to be ready (10 seconds)
sleep 10

# Run migrations
cd backend && npm run migrate
```

### 5. Instagram OAuth Not Working

**Symptom:**
- "Invalid platform app" error
- "No Instagram Business Account found" error
- Redirect fails
- "Invalid redirect URI" error

**Solution:**

**Important:** Instagram Basic Display API больше не работает. Нужно использовать Facebook Login.

1. **Проверьте тип приложения:**
   - Должно быть Facebook App (не Instagram Basic Display)
   - Должен быть добавлен продукт "Facebook Login"

2. **Проверьте настройки Facebook Login:**
   - Перейдите в Facebook App → Facebook Login → Settings
   - В "Valid OAuth Redirect URIs" должен быть: `http://localhost:3001/api/auth/instagram/callback`

3. **Проверьте Instagram аккаунт:**
   - Должен быть **Business Account** (не Personal)
   - Должен быть связан с **Facebook Page**
   - Конвертация: Instagram → Settings → Account → Switch to Professional Account → Business

4. **Проверьте права доступа:**
   - В Facebook App должны быть запрошены права: `instagram_basic`, `pages_show_list`
   - Для тестирования добавьте себя как Developer или Test User

5. **Проверьте .env файл:**
   - `INSTAGRAM_CLIENT_ID` = Facebook App ID
   - `INSTAGRAM_CLIENT_SECRET` = Facebook App Secret
   - `INSTAGRAM_REDIRECT_URI` = точный URI из настроек

**Подробная инструкция:** См. [INSTAGRAM_SETUP.md](./INSTAGRAM_SETUP.md)

### 6. Frontend Can't Connect to Backend

**Symptom:**
```
Network Error
```

**Solution:**
1. Check backend is running on port 3001:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

2. Check CORS settings in backend
3. Verify `VITE_API_URL` in `.env` is set to `http://localhost:3001`

### 7. Environment Variables Not Loading

**Symptom:**
- `undefined` values in console
- Connection errors

**Solution:**
1. Ensure `.env` file exists in root directory:
```bash
ls -la .env
```

2. Check `.env` format (no quotes around values):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/insta_sales
```

3. Restart development servers after changing `.env`

### 8. Module Not Found Errors

**Symptom:**
```
Cannot find module 'xyz'
```

**Solution:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 9. TypeScript Errors

**Symptom:**
```
TS2307: Cannot find module '@/...'
```

**Solution:**
```bash
# Frontend
cd frontend
rm -rf node_modules .vite
npm install
npm run dev

# Backend
cd backend
rm -rf node_modules dist
npm install
npm run dev
```

### 10. Docker Build Fails

**Symptom:**
```
ERROR [internal] load metadata for docker.io/library/node:20-alpine
```

**Solution:**
```bash
# Pull base images
docker pull node:20-alpine
docker pull postgres:16-alpine
docker pull nginx:alpine

# Rebuild
docker-compose build --no-cache
```

## Checking Service Status

### Backend
```bash
# Check if running
lsof -i :3001

# Test endpoint
curl http://localhost:3001/health
```

### Frontend
```bash
# Check if running
lsof -i :5173

# Open in browser
open http://localhost:5173
```

### Database
```bash
# Check Docker container
docker ps | grep postgres

# Check connection
docker exec insta-sales-db psql -U postgres -d insta_sales -c "SELECT version();"

# View logs
docker logs insta-sales-db
```

## Reset Everything

If all else fails, reset the entire environment:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start fresh
docker-compose up -d postgres
sleep 10
cd backend && npm run migrate && cd ..
npm run dev
```

## Getting Help

If you're still stuck:

1. Check the logs:
   - Backend: Terminal output
   - Frontend: Browser console (F12)
   - Database: `docker logs insta-sales-db`

2. Verify all services are running:
   ```bash
   docker ps
   lsof -i :3001
   lsof -i :5173
   ```

3. Check environment variables are loaded:
   ```bash
   cat .env
   ```

4. Review the setup checklist: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
