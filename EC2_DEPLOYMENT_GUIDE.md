# SX-HRIS Backend - Amazon EC2 Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [EC2 Instance Setup](#ec2-instance-setup)
4. [Deployment Methods](#deployment-methods)
5. [Configuration](#configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [CI/CD Integration](#cicd-integration)

---

## 🎯 Overview

This guide provides comprehensive instructions for deploying the SX-HRIS backend application to Amazon EC2. The deployment supports multiple methods:

- **PM2 Process Manager** (Recommended for simple deployments)
- **Docker Container** (Recommended for scalability)
- **Docker Compose** (Full stack deployment)

### Architecture

```
Internet
    ↓
Amazon Route 53 (DNS)
    ↓
AWS ELB/ALB (Load Balancer) [Optional]
    ↓
EC2 Instance(s)
    ↓
Nginx (Reverse Proxy + SSL)
    ↓
PM2/Docker (Process Manager)
    ↓
Node.js Application (NestJS)
    ↓
PostgreSQL (RDS/Supabase)
```

---

## ✅ Prerequisites

### AWS Account Requirements
- Active AWS account with EC2 access
- IAM user with appropriate permissions
- Key pair for SSH access
- Security group configured

### Local Development Machine
- AWS CLI installed and configured
- SSH client
- Git installed
- Node.js 18+ (for local testing)

### External Services
- PostgreSQL database (AWS RDS, Supabase, or self-hosted)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt or AWS Certificate Manager)

---

## 🚀 EC2 Instance Setup

### Step 1: Launch EC2 Instance

#### Recommended Instance Configuration

| Component | Specification | Notes |
|-----------|---------------|-------|
| **Instance Type** | t3.medium | 2 vCPU, 4 GB RAM (minimum) |
| **AMI** | Ubuntu 22.04 LTS | 64-bit (x86) |
| **Storage** | 30 GB gp3 SSD | Scalable as needed |
| **Security Group** | Custom | See ports below |

#### Required Security Group Rules

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
| Custom TCP | TCP | 3000 | Security Group | Backend API (internal) |

#### Launch Instance

```bash
# Using AWS CLI
aws ec2 run-instances \
    --image-id ami-xxxxxxxxxxxxxxxxx \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxxx \
    --subnet-id subnet-xxxxxxxxx \
    --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=SX-HRIS-Backend}]'
```

### Step 2: Connect to EC2 Instance

```bash
# Get your instance public DNS
aws ec2 describe-instances \
    --instance-ids i-0f823496f0d2b607d \
    --query 'Reservations[0].Instances[0].PublicDnsName'

# SSH into instance
ssh -i /path/to/your-key.pem ec2-user@16.16.254.121
```

### Step 3: Run Initial Setup Script

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/your-repo/sx-hris/main/backend/scripts/ec2-setup.sh

# Make executable
chmod +x ec2-setup.sh

# Run as root
sudo ./ec2-setup.sh

# Reboot after setup
sudo reboot
```

**What the setup script installs:**
- Node.js 18.x LTS
- npm and PM2
- PostgreSQL client
- Docker and Docker Compose
- Nginx web server
- Security tools (UFW, fail2ban)
- System optimizations

---

## 📦 Deployment Methods

### Method 1: PM2 Deployment (Recommended for Simple Setups)

#### Initial Deployment

```bash
# 1. Clone repository
cd /home/ec2-user
git clone https://github.com/your-org/sx-hris.git sx-hris-backend
cd sx-hris-backend/backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.production .env
nano .env  # Edit with your credentials

# 4. Build application
npm run build

# 5. Run database migrations
npm run migration:run

# 6. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow instructions to enable startup on boot
```

#### Subsequent Deployments

```bash
# Use the deployment script
cd /home/ec2-user/sx-hris-backend/backend
./scripts/deploy.sh production
```

### Method 2: Docker Deployment

#### Build and Run Docker Container

```bash
# 1. Clone repository
cd /home/ec2-user
git clone https://github.com/your-org/sx-hris.git sx-hris-backend
cd sx-hris-backend/backend

# 2. Configure environment
cp .env.production .env
nano .env  # Edit with your credentials

# 3. Build Docker image
docker build -t sx-hris-backend:latest .

# 4. Run container
docker run -d \
    --name sx-hris-backend \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env \
    -v $(pwd)/logs:/app/logs \
    sx-hris-backend:latest

# 5. Check logs
docker logs -f sx-hris-backend
```

### Method 3: Docker Compose (Full Stack)

```bash
# 1. Clone repository
cd /home/ec2-user
git clone https://github.com/your-org/sx-hris.git sx-hris-backend
cd sx-hris-backend/backend

# 2. Configure environment
cp .env.production .env
nano .env

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f backend
```

---

## ⚙️ Configuration

### Environment Variables (.env.production)

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api
TIMEZONE=UTC

# Database - AWS RDS PostgreSQL
DB_HOST=your-rds-instance.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=sx_hris_user
DB_PASSWORD=your-secure-password-here
DB_NAME=sx_hris_db
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_SSL=true

# JWT Security
JWT_SECRET=generate-a-secure-random-string-min-32-chars
JWT_EXPIRATION=3600

# i18n
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,fr,de,es,ja,zh

# AWS (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=sx-hris-uploads

# Monitoring (Optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEW_RELIC_LICENSE_KEY=your-license-key
```

### Nginx Configuration

```bash
# 1. Copy Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/sx-hris-backend

# 2. Update domain name
sudo nano /etc/nginx/sites-available/sx-hris-backend
# Replace 'your-domain.com' with your actual domain

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/sx-hris-backend /etc/nginx/sites-enabled/

# 4. Test configuration
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Run SSL setup script
sudo ./scripts/setup-ssl.sh your-domain.com

# Verify certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Maintenance

### PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs sx-hris-backend

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart sx-hris-backend

# Stop application
pm2 stop sx-hris-backend

# View detailed info
pm2 info sx-hris-backend
```

### Docker Monitoring

```bash
# View container status
docker ps

# View logs
docker logs -f sx-hris-backend

# View resource usage
docker stats sx-hris-backend

# Execute command in container
docker exec -it sx-hris-backend sh

# Restart container
docker restart sx-hris-backend
```

### Health Checks

```bash
# Run health check script
./scripts/health-check.sh

# Manual health check
curl http://localhost:3000/api/health

# Check Nginx
curl http://localhost:8080/nginx-health
```

### Log Management

```bash
# View application logs
tail -f /home/ubuntu/sx-hris-backend/logs/pm2-error.log
tail -f /home/ubuntu/sx-hris-backend/logs/pm2-out.log

# View Nginx logs
sudo tail -f /var/log/nginx/sx-hris-backend-access.log
sudo tail -f /var/log/nginx/sx-hris-backend-error.log

# Rotate logs manually
sudo logrotate -f /etc/logrotate.d/sx-hris-backend
```

### Database Maintenance

```bash
# Connect to database
psql -h your-db-host -U your-username -d sx_hris_db

# Run migrations
npm run migration:run

# Backup database
pg_dump -h your-db-host -U your-username -d sx_hris_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -h your-db-host -U your-username -d sx_hris_db < backup_20260501.sql
```

---

## 🔒 Security Best Practices

### 1. SSH Hardening

```bash
# Change SSH port (edit /etc/ssh/sshd_config)
sudo nano /etc/ssh/sshd_config
# Change: Port 2222

# Disable password authentication
# PasswordAuthentication no
# PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

### 2. Firewall Configuration

```bash
# Allow new SSH port
sudo ufw allow 2222/tcp

# Remove old SSH rule
sudo ufw delete allow 22/tcp

# Check status
sudo ufw status
```

### 3. Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt-get install -y unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Fail2Ban Configuration

```bash
# Check fail2ban status
sudo fail2ban-client status

# View banned IPs
sudo fail2ban-client status sshd
```

### 5. Environment Variable Security

```bash
# Restrict .env file permissions
chmod 600 .env
chown ubuntu:ubuntu .env

# Never commit .env to Git
echo ".env" >> .gitignore
```

---

## 🔧 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs sx-hris-backend --lines 100

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Check environment variables
pm2 env 0

# Restart application
pm2 restart sx-hris-backend
```

### Database Connection Issues

```bash
# Test database connectivity
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME

# Check environment variables
cat .env | grep DB_

# Test from application
node -e "require('pg').Client({host:'$DB_HOST',user:'$DB_USERNAME',password:'$DB_PASSWORD',database:'$DB_NAME',ssl:true}).connect().then(()=>console.log('OK')).catch(console.error)"
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Check process memory
pm2 monit

# Restart application with memory limit
pm2 restart ecosystem.config.js --max-memory-restart 1G
```

### SSL Certificate Issues

```bash
# Verify certificate
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/deploy-ec2.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/sx-hris-backend/backend
            git pull origin main
            ./scripts/deploy.sh production
```

### Required GitHub Secrets

- `EC2_HOST`: EC2 instance public DNS
- `EC2_SSH_KEY`: Private SSH key content

---

## 📈 Scaling Strategies

### Vertical Scaling (Single Instance)

```bash
# Stop application
pm2 stop sx-hris-backend

# Resize EC2 instance via AWS Console
# t3.medium → t3.large → t3.xlarge

# Start application
pm2 start sx-hris-backend
```

### Horizontal Scaling (Multiple Instances)

1. Create AMI from current instance
2. Launch multiple instances from AMI
3. Set up Application Load Balancer (ALB)
4. Configure health checks
5. Set up auto-scaling group

### Database Scaling

- Use AWS RDS with read replicas
- Enable Multi-AZ deployment
- Implement connection pooling
- Add Redis for caching

---

## 📞 Support & Resources

### Documentation
- Backend API: `https://your-domain.com/api/docs`
- Swagger UI: `https://your-domain.com/api/docs`

### Monitoring
- PM2 Dashboard: `pm2 web`
- Health Check: `https://your-domain.com/api/health`

### Logs
- Application: `/home/ubuntu/sx-hris-backend/logs/`
- Nginx: `/var/log/nginx/`
- System: `/var/log/syslog`

---

## ✅ Post-Deployment Checklist

- [ ] EC2 instance launched and accessible
- [ ] Security group rules configured
- [ ] SSH access working
- [ ] Node.js and dependencies installed
- [ ] Database connection tested
- [ ] Environment variables configured
- [ ] Application built successfully
- [ ] Database migrations run
- [ ] Application running (PM2/Docker)
- [ ] Health check passing
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] HTTPS working
- [ ] PM2 startup enabled
- [ ] Logs rotating properly
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backups scheduled
- [ ] Documentation updated

---

## 🎉 Deployment Complete!

Your SX-HRIS backend is now running on Amazon EC2!

**Access URLs:**
- API: `https://your-domain.com/api`
- Health: `https://your-domain.com/api/health`
- Swagger: `https://your-domain.com/api/docs`

For support, contact: admin@your-domain.com
