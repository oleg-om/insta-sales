# Deployment Guide

This guide covers deploying InstaSales to a production server using Docker.

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- At least 2GB RAM
- 20GB disk space

### Local Requirements
- SSH access to your server
- GitHub repository access

## Server Setup

### 1. Install Docker

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Create Application Directory

```bash
sudo mkdir -p /opt/insta-sales
sudo chown $USER:$USER /opt/insta-sales
```

### 3. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SERVER_HOST` | Your server IP or domain | `123.456.789.0` |
| `SERVER_USER` | SSH username | `ubuntu` |
| `SERVER_SSH_KEY` | Private SSH key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH port (optional) | `22` |
| `POSTGRES_PASSWORD` | Database password | Generate strong password |
| `JWT_SECRET` | JWT signing secret | Generate random 32+ char string |

### Optional Secrets

| Secret Name | Description | Default |
|-------------|-------------|---------|
| `POSTGRES_USER` | Database username | `instasales` |
| `POSTGRES_DB` | Database name | `instasales` |
| `FRONTEND_URL` | Frontend URL | `http://localhost` |
| `VITE_API_URL` | API URL for frontend | Server's API URL |
| `INSTAGRAM_CLIENT_ID` | Instagram OAuth Client ID | - |
| `INSTAGRAM_CLIENT_SECRET` | Instagram OAuth Secret | - |
| `INSTAGRAM_REDIRECT_URI` | Instagram OAuth Redirect | - |

### Generating Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate POSTGRES_PASSWORD
openssl rand -base64 24
```

### Getting SSH Key

```bash
# On your local machine
cat ~/.ssh/id_rsa

# Copy the entire output including:
# -----BEGIN RSA PRIVATE KEY-----
# ... key content ...
# -----END RSA PRIVATE KEY-----
```

## Manual Deployment (First Time)

### 1. Clone Repository on Server

```bash
cd /opt/insta-sales
git clone https://github.com/YOUR_USERNAME/insta-sales.git .
```

### 2. Create `.env` File

```bash
cat > .env << 'EOF'
# Database
POSTGRES_USER=instasales
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=instasales
DATABASE_URL=postgresql://instasales:your-secure-password@postgres:5432/instasales

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=your-jwt-secret

# Instagram OAuth (optional)
INSTAGRAM_CLIENT_ID=your-client-id
INSTAGRAM_CLIENT_SECRET=your-client-secret
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/auth/instagram/callback

# Frontend
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com
EOF
```

### 3. Build and Start Services

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Run Database Migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5. Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/health

# Should return: {"status":"ok"}
```

## Automatic Deployment via GitHub Actions

Once GitHub Secrets are configured, every push to `main` branch will automatically deploy:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **GitHub Action will:**
   - Connect to your server via SSH
   - Pull latest code
   - Update `.env` file with secrets
   - Build Docker images
   - Run database migrations
   - Start containers
   - Verify health checks

3. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Click on the latest workflow run
   - View real-time logs

## Docker Commands

### View Services

```bash
# List running containers
docker compose ps

# View logs
docker compose logs

# Follow logs
docker compose logs -f backend

# View specific service logs
docker compose logs -f postgres
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Stop all services
docker compose down

# Start all services
docker compose up -d
```

### Database Management

```bash
# Access database
docker compose exec postgres psql -U instasales -d instasales

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Reset database (DANGER: deletes all data)
docker compose exec backend npx prisma migrate reset

# Backup database
docker compose exec postgres pg_dump -U instasales instasales > backup.sql

# Restore database
docker compose exec -T postgres psql -U instasales instasales < backup.sql
```

### Debugging

```bash
# Access backend container
docker compose exec backend sh

# Access frontend container
docker compose exec frontend sh

# Check backend health
docker compose exec backend wget -qO- http://localhost:3001/health

# View environment variables
docker compose exec backend env
```

## Production Optimizations

### 1. Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 2. Configure Nginx Reverse Proxy

The included `nginx.conf` provides:
- Rate limiting
- Gzip compression
- Security headers
- SSL/TLS termination

To use it:

```bash
# Start with nginx proxy profile
docker compose --profile with-proxy up -d
```

### 3. Set Up Monitoring

```bash
# Install monitoring tools
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --cleanup
```

### 4. Configure Backups

```bash
# Create backup script
cat > /opt/insta-sales/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T postgres pg_dump -U instasales instasales > $BACKUP_DIR/db_$DATE.sql

# Backup .env
cp .env $BACKUP_DIR/env_$DATE

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/insta-sales/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/insta-sales/backup.sh >> /var/log/backup.log 2>&1") | crontab -
```

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker compose logs

# Remove volumes and restart
docker compose down -v
docker compose up -d
```

### Database Connection Issues

```bash
# Check database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Migration Failures

```bash
# Check migration status
docker compose exec backend npx prisma migrate status

# Force migration
docker compose exec backend npx prisma migrate resolve --applied <migration_name>
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Restart services
docker compose restart

# Consider upgrading server resources
```

### Port Already in Use

```bash
# Find process using port 80
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

## Rollback Deployment

```bash
# On server
cd /opt/insta-sales

# Check commit history
git log --oneline -10

# Rollback to previous commit
git reset --hard <commit-hash>

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

## Monitoring and Logs

### View Application Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Monitor Resources

```bash
# Real-time stats
docker stats

# Check disk usage
docker system df
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database health
docker compose exec postgres pg_isready -U instasales

# All services
docker compose ps
```

## Security Best Practices

1. **Keep secrets secure:**
   - Never commit `.env` to git
   - Use strong passwords
   - Rotate secrets regularly

2. **Keep Docker updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Monitor logs regularly:**
   ```bash
   docker compose logs --tail=100
   ```

4. **Enable firewall:**
   ```bash
   sudo ufw status
   ```

5. **Set up fail2ban:**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

## Support

- Check logs: `docker compose logs`
- View status: `docker compose ps`
- Check GitHub Actions: Repository → Actions tab
- Review this guide for common issues

---

For development setup, see [README.md](README.md)
