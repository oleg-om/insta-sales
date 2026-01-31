#!/bin/bash

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "⚠️  WARNING: This will restore the database from backup!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

echo "🗄️  Restoring database from backup..."

# Decompress backup
gunzip -c $BACKUP_FILE | docker exec -i insta-sales-db-prod psql -U ${POSTGRES_USER} ${POSTGRES_DB}

echo "✅ Database restored successfully!"
