#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build images
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker exec insta-sales-backend-prod node dist/db/migrate.js

# Check health
echo "🏥 Checking service health..."
sleep 5

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend health
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "Services:"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
