#!/bin/bash

# KingSports API Backup Script
# Backs up MongoDB, Redis data, and application files

set -e

# Configuration
BACKUP_DIR="/opt/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/backup.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    echo "[ERROR] $1" >> $LOG_FILE
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    echo "[WARNING] $1" >> $LOG_FILE
}

# Create backup directory
mkdir -p $BACKUP_DIR/{mongodb,redis,app,logs}

log "Starting backup process..."

# MongoDB Backup
log "Backing up MongoDB..."
if docker-compose ps | grep -q mongo; then
    docker-compose exec -T mongo mongodump \
        --uri="$MONGODB_URI" \
        --out=/tmp/backup_$DATE \
        --gzip
    
    docker cp $(docker-compose ps -q mongo):/tmp/backup_$DATE $BACKUP_DIR/mongodb/
    
    # Compress MongoDB backup
    cd $BACKUP_DIR/mongodb
    tar -czf mongodb_backup_$DATE.tar.gz backup_$DATE
    rm -rf backup_$DATE
    
    log "MongoDB backup completed: mongodb_backup_$DATE.tar.gz"
else
    warn "MongoDB container not running, skipping database backup"
fi

# Redis Backup
log "Backing up Redis..."
if docker-compose ps | grep -q redis; then
    docker-compose exec -T redis redis-cli --rdb /tmp/dump_$DATE.rdb
    docker cp $(docker-compose ps -q redis):/tmp/dump_$DATE.rdb $BACKUP_DIR/redis/
    
    # Compress Redis backup
    cd $BACKUP_DIR/redis
    gzip dump_$DATE.rdb
    
    log "Redis backup completed: dump_$DATE.rdb.gz"
else
    warn "Redis container not running, skipping Redis backup"
fi

# Application Files Backup
log "Backing up application files..."
cd /opt/kingsports-production
tar -czf $BACKUP_DIR/app/app_backup_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='*.log' \
    .

log "Application backup completed: app_backup_$DATE.tar.gz"

# Logs Backup
log "Backing up logs..."
if [ -d "logs" ]; then
    tar -czf $BACKUP_DIR/logs/logs_backup_$DATE.tar.gz logs/
    log "Logs backup completed: logs_backup_$DATE.tar.gz"
fi

# Calculate backup sizes
MONGODB_SIZE=$(du -h $BACKUP_DIR/mongodb/mongodb_backup_$DATE.tar.gz 2>/dev/null | cut -f1 || echo "0")
REDIS_SIZE=$(du -h $BACKUP_DIR/redis/dump_$DATE.rdb.gz 2>/dev/null | cut -f1 || echo "0")
APP_SIZE=$(du -h $BACKUP_DIR/app/app_backup_$DATE.tar.gz 2>/dev/null | cut -f1 || echo "0")
LOGS_SIZE=$(du -h $BACKUP_DIR/logs/logs_backup_$DATE.tar.gz 2>/dev/null | cut -f1 || echo "0")

# Cleanup old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb.gz" -mtime +$RETENTION_DAYS -delete

# Create backup manifest
cat > $BACKUP_DIR/backup_manifest_$DATE.json <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "backup_id": "$DATE",
  "files": {
    "mongodb": {
      "file": "mongodb/mongodb_backup_$DATE.tar.gz",
      "size": "$MONGODB_SIZE"
    },
    "redis": {
      "file": "redis/dump_$DATE.rdb.gz",
      "size": "$REDIS_SIZE"
    },
    "application": {
      "file": "app/app_backup_$DATE.tar.gz",
      "size": "$APP_SIZE"
    },
    "logs": {
      "file": "logs/logs_backup_$DATE.tar.gz",
      "size": "$LOGS_SIZE"
    }
  },
  "total_files": $(find $BACKUP_DIR -name "*_$DATE.*" | wc -l),
  "retention_days": $RETENTION_DAYS
}
EOF

# Upload to cloud storage (if configured)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    log "Uploading backups to S3..."
    aws s3 sync $BACKUP_DIR s3://$AWS_S3_BUCKET/backups/$(date +%Y/%m/%d)/ \
        --exclude "*" \
        --include "*_$DATE.*" \
        --storage-class STANDARD_IA
    log "S3 upload completed"
fi

# Send notification
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\": \"📦 KingSports API Backup Completed\",
            \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                    {\"title\": \"Backup ID\", \"value\": \"$DATE\", \"short\": true},
                    {\"title\": \"MongoDB\", \"value\": \"$MONGODB_SIZE\", \"short\": true},
                    {\"title\": \"Redis\", \"value\": \"$REDIS_SIZE\", \"short\": true},
                    {\"title\": \"Application\", \"value\": \"APP_SIZE\", \"short\": true}
                ]
            }]
        }" \
        $SLACK_WEBHOOK_URL
fi

# Verify backups
log "Verifying backup integrity..."
BACKUP_COUNT=$(find $BACKUP_DIR -name "*_$DATE.*" | wc -l)
if [ $BACKUP_COUNT -ge 3 ]; then
    log "✅ Backup verification passed ($BACKUP_COUNT files created)"
else
    error "❌ Backup verification failed (only $BACKUP_COUNT files created)"
fi

log "Backup process completed successfully!"
echo "📋 Backup Summary:"
echo "   Backup ID: $DATE"
echo "   MongoDB: $MONGODB_SIZE"
echo "   Redis: $REDIS_SIZE"
echo "   Application: $APP_SIZE"
echo "   Logs: $LOGS_SIZE"
echo "   Location: $BACKUP_DIR"