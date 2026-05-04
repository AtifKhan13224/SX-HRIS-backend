#!/bin/bash

###############################################################################
# SX-HRIS Backend - Rollback Script
# 
# This script rolls back the application to a previous backup.
#
# Usage:
#   chmod +x scripts/rollback.sh
#   ./scripts/rollback.sh [backup_timestamp]
#
# Parameters:
#   backup_timestamp: Timestamp of backup to restore (e.g., 20260501_143000)
#                    If not provided, lists available backups
###############################################################################

set -e

# Configuration
APP_NAME="sx-hris-backend"
APP_DIR="/home/ec2-user/${APP_NAME}"
BACKUP_DIR="/home/ec2-user/backups"
TIMESTAMP="${1:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# List available backups if no timestamp provided
if [ -z "$TIMESTAMP" ]; then
    log_info "Available backups:"
    echo ""
    ls -lt ${BACKUP_DIR} | grep backup_ | awk '{print $9, $6, $7, $8}'
    echo ""
    log_info "Usage: ./scripts/rollback.sh [backup_timestamp]"
    log_info "Example: ./scripts/rollback.sh 20260501_143000"
    exit 0
fi

# Verify backup exists
BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}"
if [ ! -d "$BACKUP_PATH" ]; then
    log_error "Backup not found: $BACKUP_PATH"
    exit 1
fi

log_warning "This will rollback the application to backup: $TIMESTAMP"
read -p "Are you sure? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    log_info "Rollback cancelled"
    exit 0
fi

# Stop application
log_info "Stopping application..."
pm2 stop ${APP_NAME} || true

# Restore backup
log_info "Restoring backup..."
cd $APP_DIR

# Remove current dist
rm -rf dist

# Restore dist from backup
cp -r ${BACKUP_PATH}/dist .

# Restore .env if exists
if [ -f "${BACKUP_PATH}/.env" ]; then
    cp ${BACKUP_PATH}/.env .
fi

# Start application
log_info "Starting application..."
pm2 start ecosystem.config.js --env production

# Wait for startup
sleep 10

# Verify application is running
if pm2 list | grep -q ${APP_NAME}; then
    log_info "Rollback completed successfully!"
    pm2 logs ${APP_NAME} --lines 20 --nostream
else
    log_error "Application failed to start after rollback"
    exit 1
fi
