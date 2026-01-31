#!/bin/sh

set -e

# Default domain if not set
DOMAIN=${DOMAIN:-localhost}

# Check if using Cloudflare
USE_CLOUDFLARE=${USE_CLOUDFLARE:-false}

echo "🌐 Configuring Nginx for domain: $DOMAIN"

# Choose template based on Cloudflare usage
if [ "$USE_CLOUDFLARE" = "true" ]; then
  echo "☁️  Using Cloudflare configuration"
  TEMPLATE="/etc/nginx/nginx.conf.cloudflare.template"
else
  echo "🔧 Using standard configuration"
  TEMPLATE="/etc/nginx/nginx.conf.template"
fi

# Replace ${DOMAIN} in template with actual domain
envsubst '${DOMAIN}' < "$TEMPLATE" > /etc/nginx/nginx.conf

echo "✅ Nginx configuration generated"
echo "📋 Server name: $DOMAIN www.$DOMAIN"

# Test nginx configuration
nginx -t

# Start nginx
exec nginx -g 'daemon off;'
