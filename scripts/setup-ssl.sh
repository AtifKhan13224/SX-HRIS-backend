#!/bin/bash

###############################################################################
# SSL Certificate Setup Script for SX-HRIS Backend
# 
# This script sets up Let's Encrypt SSL certificates using Certbot.
#
# Usage:
#   chmod +x scripts/setup-ssl.sh
#   sudo ./scripts/setup-ssl.sh your-domain.com
###############################################################################

set -e

DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: sudo ./scripts/setup-ssl.sh your-domain.com"
    exit 1
fi

# Install Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --redirect

# Set up auto-renewal
certbot renew --dry-run

echo "SSL certificate installed successfully!"
echo "Certificates will auto-renew via systemd timer"
