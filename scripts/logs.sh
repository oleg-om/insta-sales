#!/bin/bash

# Show logs for all services or specific service

SERVICE=${1:-}

if [ -z "$SERVICE" ]; then
    echo "📋 Showing logs for all services..."
    docker-compose -f docker-compose.prod.yml logs -f
else
    echo "📋 Showing logs for $SERVICE..."
    docker-compose -f docker-compose.prod.yml logs -f $SERVICE
fi
