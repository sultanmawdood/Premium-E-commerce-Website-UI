#!/bin/bash

# KingSports API Production Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="kingsports-api"
DEPLOY_USER="deploy"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/deploy.log"

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    error "Invalid environment. Use 'staging' or 'production'"
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_PATH="/opt/kingsports-production"
    COMPOSE_FILE="docker-compose.yml"
    DOMAIN="api.kingsports.com"
else
    DEPLOY_PATH="/opt/kingsports-staging"
    COMPOSE_FILE="docker-compose.staging.yml"
    DOMAIN="staging-api.kingsports.com"
fi

log "Deploying to $ENVIRONMENT environment at $DEPLOY_PATH"

# Create deployment directory if it doesn't exist
sudo mkdir -p $DEPLOY_PATH
sudo chown $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH

# Navigate to deployment directory
cd $DEPLOY_PATH

# Backup current deployment
if [ -d "current" ]; then
    log "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r current $BACKUP_DIR/$BACKUP_NAME
    log "Backup created at $BACKUP_DIR/$BACKUP_NAME"
fi

# Clone or update repository
if [ ! -d ".git" ]; then
    log "Cloning repository..."
    git clone https://github.com/yourusername/kingsports-api.git .
else
    log "Updating repository..."
    git fetch origin
    git reset --hard origin/main
fi

# Install/update dependencies
log "Installing dependencies..."
cd backend
npm ci --production

# Copy environment file
log "Setting up environment configuration..."
if [ ! -f ".env.$ENVIRONMENT" ]; then
    error "Environment file .env.$ENVIRONMENT not found!"
fi
cp .env.$ENVIRONMENT .env

# Build Docker images
log "Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Run database migrations if needed
log "Running database setup..."
docker-compose -f $COMPOSE_FILE run --rm kingsports-api npm run migrate

# Health check before stopping current services
log "Performing pre-deployment health check..."
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    if ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        warn "Current deployment health check failed, proceeding anyway..."
    fi
fi

# Stop current services
log "Stopping current services..."
docker-compose -f $COMPOSE_FILE down

# Start new services
log "Starting new services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 30

# Health check
log "Performing post-deployment health check..."
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=10

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log "Health check passed!"
        break
    else
        if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
            error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
        fi
        warn "Health check attempt $i failed, retrying in ${HEALTH_CHECK_DELAY}s..."
        sleep $HEALTH_CHECK_DELAY
    fi
done

# Update Nginx configuration if needed
if [ -f "nginx.conf" ]; then
    log "Updating Nginx configuration..."
    sudo cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# Clean up old Docker images
log "Cleaning up old Docker images..."
docker system prune -f

# Set up log rotation
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/$PROJECT_NAME > /dev/null <<EOF
$DEPLOY_PATH/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        docker-compose -f $DEPLOY_PATH/$COMPOSE_FILE restart kingsports-api
    endscript
}
EOF

# Set up monitoring alerts
log "Setting up monitoring..."
if command -v systemctl &> /dev/null; then
    # Create systemd service for monitoring
    sudo tee /etc/systemd/system/$PROJECT_NAME-monitor.service > /dev/null <<EOF
[Unit]
Description=KingSports API Monitor
After=docker.service

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$DEPLOY_PATH
ExecStart=/bin/bash -c 'while true; do curl -f http://localhost:5000/api/health || echo "Health check failed at \$(date)" >> /var/log/$PROJECT_NAME-monitor.log; sleep 60; done'
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable $PROJECT_NAME-monitor
    sudo systemctl start $PROJECT_NAME-monitor
fi

# Final verification
log "Performing final verification..."
API_RESPONSE=$(curl -s http://localhost:5000/api/health)
if echo "$API_RESPONSE" | grep -q '"status":"healthy"'; then
    log "✅ Deployment completed successfully!"
    log "API is running at http://$DOMAIN"
    log "Health status: $(echo "$API_RESPONSE" | jq -r '.status')"
else
    error "❌ Deployment verification failed!"
fi

# Send notification (if configured)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 KingSports API deployed successfully to $ENVIRONMENT\"}" \
        $SLACK_WEBHOOK_URL
fi

log "Deployment completed at $(date)"
echo "📋 Deployment summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Path: $DEPLOY_PATH"
echo "   Health: ✅ Healthy"
echo "   Logs: $LOG_FILE"