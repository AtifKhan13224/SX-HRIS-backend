#!/bin/bash

###############################################################################
# SX-HRIS Backend - EC2 Initial Setup Script
# 
# This script performs the initial setup of a fresh EC2 instance for
# deploying the SX-HRIS backend application.
#
# Usage:
#   chmod +x scripts/ec2-setup.sh
#   sudo ./scripts/ec2-setup.sh
#
# Prerequisites:
#   - Fresh Ubuntu 22.04 LTS EC2 instance
#   - Run as root or with sudo
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root or with sudo"
    exit 1
fi

log_info "Starting SX-HRIS Backend EC2 Setup..."

# Update system packages
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    vim \
    unzip

# Install Node.js 18.x LTS
log_info "Installing Node.js 18.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_info "Node.js version: $NODE_VERSION"
log_info "npm version: $NPM_VERSION"

# Install PM2 globally
log_info "Installing PM2 process manager..."
npm install -g pm2
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Install PostgreSQL client (for database management)
log_info "Installing PostgreSQL client..."
apt-get install -y postgresql-client

# Install Docker (optional - for containerized deployment)
log_info "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Docker Compose standalone
log_info "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
log_info "Installing Nginx..."
apt-get install -y nginx

# Configure firewall
log_info "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Backend API (optional - can be removed if using Nginx)
ufw status

# Configure fail2ban for SSH protection
log_info "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
log_info "Creating application directory..."
mkdir -p /home/ec2-user/sx-hris-backend
chown -R ec2-user:ec2-user /home/ec2-user/sx-hris-backend

# Create logs directory
mkdir -p /home/ec2-user/sx-hris-backend/logs
chown -R ec2-user:ec2-user /home/ec2-user/sx-hris-backend/logs

# Set up log rotation
log_info "Setting up log rotation..."
cat > /etc/logrotate.d/sx-hris-backend << EOF
/home/ec2-user/sx-hris-backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ec2-user ec2-user
    sharedscripts
}
EOF

# Set timezone
log_info "Setting timezone to UTC..."
timedatectl set-timezone UTC

# Increase file descriptor limits for Node.js
log_info "Configuring system limits..."
cat >> /etc/security/limits.conf << EOF

# SX-HRIS Backend Limits
ec2-user soft nofile 65536
ec2-user hard nofile 65536
ec2-user soft nproc 65536
ec2-user hard nproc 65536
EOF

# Configure kernel parameters for better performance
cat >> /etc/sysctl.conf << EOF

# SX-HRIS Backend Optimizations
net.ipv4.tcp_max_syn_backlog = 8096
net.core.somaxconn = 8096
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
EOF
sysctl -p

# Display system information
log_info "System setup completed!"
echo ""
log_info "System Information:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Kernel: $(uname -r)"
echo "  Node.js: $NODE_VERSION"
echo "  npm: $NPM_VERSION"
echo "  PM2: $(pm2 --version)"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker-compose --version)"
echo "  PostgreSQL Client: $(psql --version)"
echo ""

log_info "Next steps:"
echo "  1. Clone your repository to /home/ec2-user/sx-hris-backend"
echo "  2. Create .env file with production credentials"
echo "  3. Run npm install"
echo "  4. Run npm run build"
echo "  5. Run database migrations"
echo "  6. Start the application with PM2 or Docker"
echo ""

log_info "Security recommendations:"
echo "  1. Change default SSH port (edit /etc/ssh/sshd_config)"
echo "  2. Disable password authentication (use SSH keys only)"
echo "  3. Set up SSL certificates with Let's Encrypt"
echo "  4. Configure database firewall rules"
echo "  5. Enable CloudWatch or similar monitoring"
echo ""

log_warning "IMPORTANT: Reboot the system for all changes to take effect"
echo "  Run: sudo reboot"
