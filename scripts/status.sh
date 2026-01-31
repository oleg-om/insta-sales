#!/bin/bash

echo "📊 Service Status"
echo "================="
echo ""

# Check if containers are running
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🏥 Health Checks"
echo "================"
echo ""

# Check backend health
echo -n "Backend:  "
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Check frontend health
echo -n "Frontend: "
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

echo ""
echo "💾 Disk Usage"
echo "============="
docker system df

echo ""
echo "📊 Container Stats"
echo "=================="
docker stats --no-stream
