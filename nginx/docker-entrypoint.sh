#!/bin/sh

set -e

# Default domain if not set
DOMAIN=${DOMAIN:-localhost}

echo "🌐 Configuring Nginx for domain: $DOMAIN"

# Replace ${DOMAIN} in template with actual domain
envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "✅ Nginx configuration generated"
echo "📋 Server name: $DOMAIN www.$DOMAIN"

# Test nginx configuration
nginx -t

# Start nginx
exec nginx -g 'daemon off;'
