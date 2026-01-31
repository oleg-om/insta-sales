FROM nginx:alpine

# Install envsubst (gettext package)
RUN apk add --no-cache gettext

# Copy templates and entrypoint
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx.conf.cloudflare.template /etc/nginx/nginx.conf.cloudflare.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 80 443

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
