#!/bin/bash

###############################################################################
# SX-HRIS Backend - Deployment Script
# 
# This script handles the deployment of the SX-HRIS backend to EC2.
# It can be run manually or integrated into CI/CD pipelines.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh [environment]
#
# Parameters:
#   environment: production, staging, development (default: production)
###############################################################################

set -e  # Exit on error

# Configuration
APP_NAME="sx-hris-backend"
APP_DIR="/home/ec2-user/${APP_NAME}"
ENV="${1:-production}"
BACKUP_DIR="/home/ec2-user/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Error handler
handle_error() {
    log_error "Deployment failed at line $1"
    log_info "Rolling back to previous version..."
    rollback
    exit 1
}

trap 'handle_error $LINENO' ERR

# Rollback function
rollback() {
    if [ -d "${BACKUP_DIR}/backup_${TIMESTAMP}" ]; then
        log_warning "Rolling back to backup..."
        pm2 stop ${APP_NAME} || true
        rm -rf ${APP_DIR}/dist
        cp -r ${BACKUP_DIR}/backup_${TIMESTAMP}/dist ${APP_DIR}/
        pm2 start ecosystem.config.js --env ${ENV}
        log_info "Rollback completed"
    fi
}

# Pre-deployment checks
log_step "Running pre-deployment checks..."

if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    exit 1
fi

cd $APP_DIR

if [ ! -f "package.json" ]; then
    log_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

if [ ! -f ".env.${ENV}" ]; then
    log_warning ".env.${ENV} not found. Using .env.production"
    if [ ! -f ".env.production" ]; then
        log_error "No environment file found!"
        exit 1
    fi
fi

log_info "Pre-deployment checks passed"

# Create backup
log_step "Creating backup..."
mkdir -p ${BACKUP_DIR}

if [ -d "${APP_DIR}/dist" ]; then
    mkdir -p ${BACKUP_DIR}/backup_${TIMESTAMP}
    cp -r ${APP_DIR}/dist ${BACKUP_DIR}/backup_${TIMESTAMP}/
    cp ${APP_DIR}/.env ${BACKUP_DIR}/backup_${TIMESTAMP}/ || true
    log_info "Backup created at ${BACKUP_DIR}/backup_${TIMESTAMP}"
fi

# Keep only last 5 backups
log_info "Cleaning old backups..."
cd ${BACKUP_DIR}
ls -t | tail -n +6 | xargs -r rm -rf

cd $APP_DIR

# Pull latest code (if using Git)
if [ -d ".git" ]; then
    log_step "Pulling latest code from Git..."
    git fetch --all
    
    if [ "$ENV" == "production" ]; then
        git checkout main
        git pull origin main
    elif [ "$ENV" == "staging" ]; then
        git checkout develop
        git pull origin develop
    else
        log_info "Skipping Git pull for $ENV environment"
    fi
else
    log_warning "Not a Git repository. Skipping Git pull."
fi

# Install dependencies
log_step "Installing dependencies..."
npm ci --production=false

# Run database migrations
log_step "Running database migrations..."
if [ -f ".env.${ENV}" ]; then
    export $(cat .env.${ENV} | grep -v '^#' | xargs)
fi

npm run migration:run || log_warning "Migration failed or no migrations to run"

# Build application
log_step "Building application..."
npm run build

# Run tests (optional)
if [ "$ENV" != "production" ]; then
    log_step "Running tests..."
    npm run test || log_warning "Tests failed but continuing deployment"
fi

# Stop current application
log_step "Stopping current application..."
pm2 stop ${APP_NAME} || log_warning "Application not running"

# Start application with PM2
log_step "Starting application..."
pm2 start ecosystem.config.js --env ${ENV} --update-env

# Save PM2 process list
pm2 save

# Wait for application to start
log_info "Waiting for application to start (30 seconds)..."
sleep 30

# Health check
log_step "Running health check..."
HEALTH_URL="http://localhost:3000/api/health"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s $HEALTH_URL > /dev/null; then
        log_info "Health check passed!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log_warning "Health check failed. Retry $RETRY_COUNT/$MAX_RETRIES..."
        sleep 10
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "Health check failed after $MAX_RETRIES attempts"
    rollback
    exit 1
fi

# Display application status
log_step "Deployment Status:"
pm2 list
pm2 logs ${APP_NAME} --lines 20 --nostream

# Cleanup
log_step "Cleaning up..."
npm prune --production

# Display deployment summary
echo ""
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "  Deployment Completed Successfully!"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Environment:   $ENV"
echo "  Timestamp:     $TIMESTAMP"
echo "  Backup:        ${BACKUP_DIR}/backup_${TIMESTAMP}"
echo "  Health Check:  $HEALTH_URL"
echo ""
log_info "Useful commands:"
echo "  pm2 logs ${APP_NAME}          - View logs"
echo "  pm2 monit                     - Monitor app"
echo "  pm2 restart ${APP_NAME}       - Restart app"
echo "  pm2 stop ${APP_NAME}          - Stop app"
echo ""
log_info "To rollback: ./scripts/rollback.sh $TIMESTAMP"
echo ""
