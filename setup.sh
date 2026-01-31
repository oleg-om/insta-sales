#!/bin/bash

echo "🚀 Setting up Insta Sales application..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cat > .env << 'EOF'
# Database (using port 5433 to avoid conflicts with local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/insta_sales
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=insta_sales

# Backend
PORT=3001
JWT_SECRET=your-secret-key-change-in-production-$(openssl rand -hex 32)
NODE_ENV=development

# Instagram OAuth (You need to configure these)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/auth/instagram/callback

# Frontend
VITE_API_URL=http://localhost:3001
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start PostgreSQL
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
cd backend
npm run migrate
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Instagram OAuth credentials in .env file"
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
