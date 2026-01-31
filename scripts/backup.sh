#!/bin/bash

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/insta_sales_$DATE.sql"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🗄️  Creating database backup..."

# Create backup
docker exec insta-sales-db-prod pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed!"
