# SX-HRIS Backend - EC2 Instance Details

## 🖥️ Instance Information

**Instance Name**: SX-HRIS-Backend  
**Instance ID**: `i-0f823496f0d2b607d`  
**Instance Type**: (Check AWS Console for current type)  
**AMI**: Amazon Linux 2 / Ubuntu (verify in console)

---

## 🌐 Network Configuration

**Public IPv4 Address**: `16.16.254.121`  
**VPC ID**: `vpc-0d532c0079b91f4dd`  
**Security Group**: `sg-0587e5abaaad7efe6` (launch-wizard-1)

---

## 🔑 Access Information

**Username**: `ec2-user`  
**SSH Connection**:
```bash
ssh -i your-key-pair.pem ec2-user@16.16.254.121
```

**Browser-based Connection**: Available via AWS Console (EC2 Instance Connect)

---

## 📁 Application Paths

**Application Directory**: `/home/ec2-user/sx-hris-backend`  
**Logs Directory**: `/home/ec2-user/sx-hris-backend/logs`  
**Backups Directory**: `/home/ec2-user/backups`

---

## 🔌 Ports & Endpoints

| Service | Port | Access |
|---------|------|--------|
| SSH | 22 | Your IP only (recommended) |
| HTTP | 80 | Public (redirects to HTTPS) |
| HTTPS | 443 | Public |
| Backend API | 3000 | Internal (via Nginx) |

**API Endpoints**:
- Health: `http://16.16.254.121:3000/api/health`
- API Root: `http://16.16.254.121:3000/api`
- Swagger: `http://16.16.254.121:3000/api/docs`

*(Use domain name once configured)*

---

## 🚀 Quick Connection Commands

### SSH Connection
```bash
# Using your key pair
ssh -i /path/to/your-key.pem ec2-user@16.16.254.121

# If using AWS Session Manager (no key needed)
aws ssm start-session --target i-0f823496f0d2b607d
```

### Copy Files to EC2
```bash
# Upload file
scp -i your-key.pem local-file.txt ec2-user@16.16.254.121:/home/ec2-user/

# Upload directory
scp -i your-key.pem -r local-directory ec2-user@16.16.254.121:/home/ec2-user/
```

### Download Files from EC2
```bash
# Download file
scp -i your-key.pem ec2-user@16.16.254.121:/home/ec2-user/file.txt ./

# Download logs
scp -i your-key.pem -r ec2-user@16.16.254.121:/home/ec2-user/sx-hris-backend/logs ./logs
```

---

## 🔧 PM2 Deployment Configuration

The `ecosystem.config.js` has been configured with your instance details:

```javascript
production: {
  user: 'ec2-user',
  host: ['16.16.254.121'],
  ref: 'origin/main',
  path: '/home/ec2-user/sx-hris-backend'
}
```

---

## 📋 Security Group Configuration

**Security Group ID**: `sg-0587e5abaaad7efe6`

**Recommended Inbound Rules**:
```
Type        Protocol  Port Range  Source          Description
SSH         TCP       22          Your IP         SSH access
HTTP        TCP       80          0.0.0.0/0       HTTP traffic
HTTPS       TCP       443         0.0.0.0/0       HTTPS traffic
Custom TCP  TCP       3000        sg-xxxxx        Backend API (internal only)
```

**Verify/Update in AWS Console**:
```bash
# View current security group rules
aws ec2 describe-security-groups --group-ids sg-0587e5abaaad7efe6

# Add rule for HTTPS
aws ec2 authorize-security-group-ingress \
    --group-id sg-0587e5abaaad7efe6 \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

---

## 🎯 First-Time Setup

### 1. Connect to Instance
```bash
ssh -i your-key.pem ec2-user@16.16.254.121
```

### 2. Run Setup Script
```bash
# Download setup script
wget https://raw.githubusercontent.com/your-org/sx-hris/main/backend/scripts/ec2-setup.sh

# Make executable
chmod +x ec2-setup.sh

# Run as root
sudo ./ec2-setup.sh

# Reboot
sudo reboot
```

### 3. Deploy Application
```bash
# Reconnect after reboot
ssh -i your-key.pem ec2-user@16.16.254.121

# Clone repository
git clone https://github.com/your-org/sx-hris.git /home/ec2-user/sx-hris-backend
cd /home/ec2-user/sx-hris-backend/backend

# Configure environment
cp .env.production .env
nano .env  # Add your database credentials

# Deploy
chmod +x scripts/*.sh
./scripts/deploy.sh production
```

---

## 🌐 Domain Configuration (Optional)

If you have a domain name, point it to your EC2 IP:

**DNS A Record**:
```
Type: A
Name: api (or your subdomain)
Value: 16.16.254.121
TTL: 300
```

**Example**:
- `api.yourdomain.com` → `16.16.254.121`
- `backend.yourdomain.com` → `16.16.254.121`

**Then configure SSL**:
```bash
sudo ./scripts/setup-ssl.sh api.yourdomain.com
```

---

## 📊 Monitoring Commands

### Check Application Status
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@16.16.254.121

# View PM2 status
pm2 status

# View logs
pm2 logs sx-hris-backend

# Run health check
cd /home/ec2-user/sx-hris-backend/backend
./scripts/health-check.sh
```

### Remote Health Check
```bash
# From your local machine
curl http://16.16.254.121:3000/api/health

# Or with domain
curl https://api.yourdomain.com/api/health
```

---

## 🔄 Update/Redeploy

### From Local Machine (using PM2 Deploy)
```bash
# Deploy to production
pm2 deploy ecosystem.config.js production

# Or update and deploy
pm2 deploy ecosystem.config.js production update
```

### On Server
```bash
ssh -i your-key.pem ec2-user@16.16.254.121
cd /home/ec2-user/sx-hris-backend/backend
./scripts/deploy.sh production
```

---

## 🆘 Emergency Access

### AWS Console Access
1. Go to EC2 Console: https://console.aws.amazon.com/ec2/
2. Navigate to Instances
3. Select instance: `i-0f823496f0d2b607d`
4. Click "Connect" → "EC2 Instance Connect"
5. Click "Connect" button

### Session Manager (No SSH Key Needed)
```bash
aws ssm start-session --target i-0f823496f0d2b607d
```

---

## 📝 Important Notes

1. **User Changed**: This instance uses `ec2-user` (not `ubuntu`)
2. **All scripts updated** with correct username and paths
3. **Security Group**: Verify ports 80, 443 are open for public access
4. **Elastic IP**: Consider attaching an Elastic IP if you haven't already (current IP may change on restart)
5. **Backups**: Set up automated backups before going to production

---

## ✅ Next Steps

- [ ] Verify security group rules (ports 22, 80, 443)
- [ ] Attach Elastic IP (optional, prevents IP change on restart)
- [ ] Configure domain name (optional)
- [ ] Run setup script on instance
- [ ] Deploy application
- [ ] Set up SSL certificate
- [ ] Configure monitoring/alerts
- [ ] Schedule automated backups

---

**Last Updated**: May 1, 2026  
**Instance ID**: i-0f823496f0d2b607d  
**Public IP**: 16.16.254.121
