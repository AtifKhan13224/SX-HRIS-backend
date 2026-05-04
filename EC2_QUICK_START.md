# SX-HRIS Backend - EC2 Quick Start Guide

> **⚡ Deploy in 15 minutes** - Fast-track deployment guide for Amazon EC2

## 🎯 What You'll Deploy

- **NestJS Backend API** running on Node.js 18
- **PM2 Process Manager** for reliability
- **Nginx Reverse Proxy** with SSL
- **PostgreSQL Database** (Supabase/RDS)
- **Automated Deployment Scripts**

---

## 📋 Quick Prerequisites

✅ **Required:**
- AWS EC2 instance (t3.medium, Ubuntu 22.04)
- PostgreSQL database URL (Supabase/RDS)
- Domain name pointed to EC2 IP
- SSH access to EC2

---

## 🚀 Fast Deployment (3 Methods)

### Method 1: Automated Script (Fastest - 5 minutes)

```bash
# 1. SSH into EC2
ssh -i your-key.pem ec2-user@16.16.254.121

# 2. Run one-liner installer
curl -fsSL https://raw.githubusercontent.com/your-repo/sx-hris/main/backend/scripts/ec2-setup.sh | sudo bash

# 3. Clone and deploy
cd ~
git clone https://github.com/your-org/sx-hris.git sx-hris-backend
cd sx-hris-backend/backend
cp .env.production .env

# 4. Edit .env with your database credentials
nano .env

# 5. Run deployment
chmod +x scripts/*.sh
./scripts/deploy.sh production

# Done! ✅
```

### Method 2: Manual PM2 (Recommended - 10 minutes)

```bash
# 1. SSH into EC2
ssh -i your-key.pem ec2-user@16.16.254.121

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/your-org/sx-hris.git ~/sx-hris-backend
cd ~/sx-hris-backend/backend

# 5. Configure environment
cp .env.production .env
nano .env  # Add your DB credentials

# 6. Install and build
npm install
npm run build

# 7. Run migrations
npm run migration:run

# 8. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow instructions

# 9. Install Nginx (optional)
sudo yum install -y nginx  # For Amazon Linux 2
# OR
sudo apt-get install -y nginx  # For Ubuntu
sudo cp nginx.conf /etc/nginx/sites-available/sx-hris-backend
sudo ln -s /etc/nginx/sites-available/sx-hris-backend /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# Done! ✅
```

### Method 3: Docker (Scalable - 8 minutes)

```bash
# 1. SSH into EC2
ssh -i your-key.pem ec2-user@16.16.254.121

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ec2-user
newgrp docker

# 3. Clone repository
git clone https://github.com/your-org/sx-hris.git ~/sx-hris-backend
cd ~/sx-hris-backend/backend

# 4. Configure environment
cp .env.production .env
nano .env  # Add your DB credentials

# 5. Build and run
docker build -t sx-hris-backend .
docker run -d --name sx-hris-backend --restart unless-stopped -p 3000:3000 --env-file .env sx-hris-backend

# Or use Docker Compose
docker-compose up -d

# Done! ✅
```

---

## ⚙️ Essential Configuration

### .env File (Required)

```bash
# Copy and edit this
NODE_ENV=production
PORT=3000

# Your Database URL
DB_HOST=your-database.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
DB_SSL=true

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=3600
```

### Quick Environment Setup

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Test database connection
psql -h your-db-host -U postgres -d postgres -c "SELECT 1"
```

---

## 🔍 Verification

### Check if Everything Works

```bash
# 1. Check application status
pm2 status
# OR
docker ps

# 2. Test health endpoint
curl http://localhost:3000/api/health

# 3. Check logs
pm2 logs sx-hris-backend
# OR
docker logs sx-hris-backend

# 4. Test API
curl http://localhost:3000/api
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T12:00:00.000Z",
  "uptime": 120,
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "used": "45 MB",
    "total": "100 MB",
    "free": "55 MB"
  }
}
```

---

## 🌐 SSL Setup (Optional but Recommended)

```bash
# 1. Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 3. Test auto-renewal
sudo certbot renew --dry-run

# Done! Your site is now HTTPS ✅
```

---

## 🔧 Common Issues & Quick Fixes

### Issue: Application won't start

```bash
# Check logs
pm2 logs sx-hris-backend --lines 50

# Restart
pm2 restart sx-hris-backend

# Delete and restart
pm2 delete sx-hris-backend
pm2 start ecosystem.config.js --env production
```

### Issue: Database connection failed

```bash
# Test connection manually
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME

# Check environment variables
cat .env | grep DB_

# Verify SSL setting
# If using Supabase/RDS, DB_SSL must be "true"
```

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Restart application
pm2 restart sx-hris-backend
```

### Issue: Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📱 Access Your API

After successful deployment:

- **API Base URL:** `http://your-domain.com/api`
- **Health Check:** `http://your-domain.com/api/health`
- **Swagger Docs:** `http://your-domain.com/api/docs`

### Test with cURL

```bash
# Health check
curl https://your-domain.com/api/health

# API root
curl https://your-domain.com/api

# Login (example)
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

---

## 🔄 Update/Redeploy

```bash
# Quick update
cd ~/sx-hris-backend/backend
git pull
./scripts/deploy.sh production

# Manual update
cd ~/sx-hris-backend/backend
git pull
npm install
npm run build
pm2 restart sx-hris-backend
```

---

## 📊 Monitoring Commands

```bash
# View logs in real-time
pm2 logs sx-hris-backend

# Monitor resources
pm2 monit

# Check status
pm2 status

# View detailed info
pm2 info sx-hris-backend

# Restart application
pm2 restart sx-hris-backend
```

---

## 🎯 Next Steps

1. **Security:** Set up firewall rules
   ```bash
   sudo ufw enable
   sudo ufw allow 22,80,443/tcp
   ```

2. **Monitoring:** Set up CloudWatch or DataDog

3. **Backups:** Schedule database backups
   ```bash
   # Add to crontab
   0 2 * * * pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_NAME > /home/ubuntu/backups/db_$(date +\%Y\%m\%d).sql
   ```

4. **CI/CD:** Set up GitHub Actions for auto-deployment

5. **Load Balancing:** Add more instances behind ALB

---

## 📞 Need Help?

- **Full Documentation:** [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)
- **Troubleshooting:** Run `./scripts/health-check.sh`
- **Logs:** `pm2 logs sx-hris-backend`
- **Support:** Open an issue on GitHub

---

## ✅ Deployment Checklist

- [ ] EC2 instance launched (t3.medium, Ubuntu 22.04)
- [ ] SSH access configured
- [ ] Node.js 18 installed
- [ ] Repository cloned
- [ ] .env file configured with database credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] Database migrations run (`npm run migration:run`)
- [ ] Application started (PM2/Docker)
- [ ] Health check passing (`curl localhost:3000/api/health`)
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Domain DNS pointed to EC2 IP
- [ ] Firewall rules configured
- [ ] PM2 startup enabled

---

**🎉 Congratulations!** Your SX-HRIS backend is now live on EC2!

For advanced configuration, scaling, and security hardening, see the [Full Deployment Guide](./EC2_DEPLOYMENT_GUIDE.md).
