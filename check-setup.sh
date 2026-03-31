#!/bin/bash

echo "🔍 Checking InstaSales Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} Found v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} Found v$POSTGRES_VERSION"
    
    # Check if PostgreSQL is running
    echo -n "Checking if PostgreSQL is running... "
    if pg_isready &> /dev/null; then
        echo -e "${GREEN}✓${NC} Running"
    else
        echo -e "${YELLOW}⚠${NC} Not running. Start with: brew services start postgresql@14"
    fi
    
    # Check if database exists
    echo -n "Checking if 'instasales' database exists... "
    if psql -lqt | cut -d \| -f 1 | grep -qw instasales; then
        echo -e "${GREEN}✓${NC} Database exists"
    else
        echo -e "${YELLOW}⚠${NC} Database not found. Create with: createdb instasales"
    fi
else
    echo -e "${RED}✗${NC} PostgreSQL not found. Install with: brew install postgresql@14"
fi

# Check if dependencies are installed
echo ""
echo "Checking dependencies..."
echo -n "Root dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed. Run: npm install"
fi

echo -n "Client dependencies... "
if [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed. Run: npm install"
fi

echo -n "Server dependencies... "
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed. Run: npm install"
fi

# Check environment files
echo ""
echo "Checking environment files..."
echo -n ".env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check required variables
    echo -n "DB config... "
    if grep -q "DATABASE_URL=" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL (local dev)"
    elif grep -q "POSTGRES_PASSWORD=" .env; then
        echo -e "${GREEN}✓${NC} POSTGRES_* (Docker / auto DATABASE_URL)"
    else
        echo -e "${RED}✗${NC} Need DATABASE_URL or POSTGRES_PASSWORD"
    fi
    
    echo -n "JWT_SECRET... "
    if grep -q "JWT_SECRET=" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC} Missing"
    fi
    
    echo -n "INSTAGRAM_CLIENT_ID... "
    if grep -q "INSTAGRAM_CLIENT_ID=your-instagram-client-id" .env; then
        echo -e "${YELLOW}⚠${NC} Not configured (optional for testing)"
    elif grep -q "INSTAGRAM_CLIENT_ID=" .env; then
        echo -e "${GREEN}✓${NC} Configured"
    else
        echo -e "${YELLOW}⚠${NC} Missing (optional)"
    fi
else
    echo -e "${RED}✗${NC} Not found. Run: cp .env.example .env"
fi

echo -n "client/.env file... "
if [ -f "client/.env" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} Not found. Run: cp client/.env.example client/.env"
fi

# Check Prisma
echo ""
echo "Checking database setup..."
echo -n "Prisma schema... "
if [ -f "server/prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not found"
fi

echo -n "Prisma migrations... "
if [ -d "server/prisma/migrations" ]; then
    echo -e "${GREEN}✓${NC} Applied"
else
    echo -e "${YELLOW}⚠${NC} Not applied. Run: cd server && npx prisma migrate dev --name init"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. If PostgreSQL is not running:"
echo "   brew services start postgresql@14"
echo ""
echo "2. If database doesn't exist:"
echo "   createdb instasales"
echo ""
echo "3. If dependencies not installed:"
echo "   npm install"
echo ""
echo "4. If migrations not applied:"
echo "   cd server && npx prisma migrate dev --name init"
echo ""
echo "5. Start the application:"
echo "   npm run dev"
echo ""
echo "6. Open in browser:"
echo "   http://localhost:5173"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
