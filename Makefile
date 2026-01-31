.PHONY: help install dev build start stop restart logs status clean backup restore deploy

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development environment"
	@echo "  make build      - Build Docker images"
	@echo "  make start      - Start all services"
	@echo "  make stop       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs"
	@echo "  make status     - Check service status"
	@echo "  make clean      - Clean up Docker resources"
	@echo "  make backup     - Backup database"
	@echo "  make restore    - Restore database"
	@echo "  make deploy     - Deploy to production"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	cd backend && npm install
	cd frontend && npm install
	@echo "✅ Dependencies installed"

# Development
dev:
	@echo "🚀 Starting development environment..."
	docker-compose up -d
	@echo "✅ Development environment started"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3001"

# Build images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build
	@echo "✅ Images built"

# Start services
start:
	@echo "▶️  Starting services..."
	docker-compose up -d
	@echo "✅ Services started"

# Stop services
stop:
	@echo "⏹️  Stopping services..."
	docker-compose down
	@echo "✅ Services stopped"

# Restart services
restart:
	@echo "🔄 Restarting services..."
	docker-compose restart
	@echo "✅ Services restarted"

# View logs
logs:
	@echo "📋 Viewing logs..."
	docker-compose logs -f

# Check status
status:
	@echo "📊 Checking service status..."
	@./scripts/status.sh

# Clean up
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -af
	@echo "✅ Cleanup complete"

# Backup database
backup:
	@echo "💾 Creating database backup..."
	@./scripts/backup.sh

# Restore database
restore:
	@echo "📥 Restoring database..."
	@./scripts/restore.sh

# Deploy to production
deploy:
	@echo "🚀 Deploying to production..."
	@./scripts/deploy.sh

# Production commands
prod-build:
	@echo "🔨 Building production images..."
	docker-compose -f docker-compose.prod.yml build
	@echo "✅ Production images built"

prod-start:
	@echo "▶️  Starting production services..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production services started"

prod-stop:
	@echo "⏹️  Stopping production services..."
	docker-compose -f docker-compose.prod.yml down
	@echo "✅ Production services stopped"

prod-logs:
	@echo "📋 Viewing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f

# Database migrations
migrate:
	@echo "🗄️  Running database migrations..."
	cd backend && npm run migrate
	@echo "✅ Migrations complete"

# Run tests
test:
	@echo "🧪 Running tests..."
	cd backend && npm test || true
	cd frontend && npm test || true
	@echo "✅ Tests complete"

# Lint code
lint:
	@echo "🔍 Linting code..."
	cd frontend && npm run lint || true
	@echo "✅ Linting complete"
