# SX-HRIS Backend - Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### AWS Infrastructure
- [ ] EC2 instance launched (t3.medium or larger)
- [ ] Security groups configured (ports 22, 80, 443, 3000)
- [ ] Elastic IP assigned (or ALB configured)
- [ ] SSH key pair generated and secured
- [ ] IAM roles configured (if using AWS services)
- [ ] VPC and subnet configured
- [ ] Route 53 DNS configured (if using custom domain)

### Database
- [ ] PostgreSQL database provisioned (RDS/Supabase)
- [ ] Database credentials secured
- [ ] Database security group allows EC2 access
- [ ] Database SSL enabled
- [ ] Initial database created
- [ ] Database backup strategy defined

### Domain & SSL
- [ ] Domain name registered
- [ ] DNS A record pointing to EC2 IP/ALB
- [ ] SSL certificate obtained (Let's Encrypt/ACM)
- [ ] SSL certificate auto-renewal configured

---

## 🚀 Deployment Steps

### Step 1: Server Setup
- [ ] Connect to EC2 via SSH
- [ ] Update system packages (`sudo apt-get update && upgrade`)
- [ ] Install Node.js 18.x
- [ ] Install PM2 globally
- [ ] Install Nginx
- [ ] Install PostgreSQL client
- [ ] Install Docker (optional)
- [ ] Configure firewall (UFW)
- [ ] Configure fail2ban
- [ ] Set timezone to UTC
- [ ] Configure system limits (file descriptors)

### Step 2: Application Setup
- [ ] Clone repository to `/home/ubuntu/sx-hris-backend`
- [ ] Create `.env` file from `.env.production`
- [ ] Configure database credentials in `.env`
- [ ] Generate secure JWT_SECRET
- [ ] Install dependencies (`npm install`)
- [ ] Build application (`npm run build`)
- [ ] Verify build output exists (`dist/` directory)

### Step 3: Database Setup
- [ ] Test database connection
- [ ] Run database migrations (`npm run migration:run`)
- [ ] Verify tables created
- [ ] Seed initial data (if needed)
- [ ] Create database backup

### Step 4: Application Deployment
- [ ] Start application with PM2
- [ ] Verify application is running (`pm2 status`)
- [ ] Test health endpoint (`curl localhost:3000/api/health`)
- [ ] Configure PM2 startup script
- [ ] Save PM2 process list
- [ ] Test application restart

### Step 5: Nginx Configuration
- [ ] Copy nginx.conf to `/etc/nginx/sites-available/`
- [ ] Update domain name in nginx.conf
- [ ] Enable site (`ln -s` to sites-enabled)
- [ ] Test Nginx configuration (`nginx -t`)
- [ ] Reload Nginx
- [ ] Verify HTTP access

### Step 6: SSL Setup
- [ ] Install Certbot
- [ ] Obtain SSL certificate
- [ ] Configure SSL in Nginx
- [ ] Test HTTPS access
- [ ] Verify SSL certificate validity
- [ ] Test SSL auto-renewal
- [ ] Configure HSTS header

---

## ✅ Post-Deployment Verification

### Application Health
- [ ] Health endpoint responding: `/api/health`
- [ ] API root responding: `/api`
- [ ] Swagger documentation accessible: `/api/docs`
- [ ] Authentication endpoints working
- [ ] Database queries executing
- [ ] Logs being written
- [ ] No error logs present

### Performance
- [ ] Response time < 200ms for health check
- [ ] Memory usage acceptable (< 70%)
- [ ] CPU usage normal (< 50% idle)
- [ ] Disk space sufficient (> 20% free)
- [ ] Database connection pool working

### Security
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate valid and not expiring soon
- [ ] Security headers present (check with security scanner)
- [ ] Firewall rules active and correct
- [ ] SSH password authentication disabled
- [ ] Root login disabled
- [ ] Environment variables not exposed
- [ ] Sensitive files have restricted permissions (`.env` = 600)

### Monitoring
- [ ] Application logs accessible
- [ ] Error logs monitored
- [ ] PM2 monitoring active
- [ ] Nginx logs configured
- [ ] Log rotation configured
- [ ] Disk space monitoring set up
- [ ] Uptime monitoring configured (optional)
- [ ] Alert system configured (optional)

---

## 🔒 Security Hardening Checklist

### SSH Security
- [ ] Change default SSH port
- [ ] Disable password authentication
- [ ] Disable root login
- [ ] Configure SSH key authentication only
- [ ] Set up fail2ban for SSH
- [ ] Configure firewall to allow only SSH from trusted IPs

### Application Security
- [ ] Environment variables secured
- [ ] JWT secret is strong (32+ characters)
- [ ] Database credentials are strong
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers configured
- [ ] Input validation enabled
- [ ] SQL injection prevention active

### Server Security
- [ ] Automatic security updates enabled
- [ ] Firewall (UFW) configured and active
- [ ] Fail2ban configured
- [ ] Unnecessary services disabled
- [ ] System logs monitored
- [ ] File permissions configured correctly
- [ ] Non-root user running application

### Network Security
- [ ] Security groups restrictive
- [ ] Database not publicly accessible
- [ ] VPC properly configured
- [ ] Private subnets used where appropriate
- [ ] Network ACLs configured

---

## 📊 Monitoring & Maintenance Checklist

### Daily
- [ ] Check application status (`pm2 status`)
- [ ] Review error logs
- [ ] Verify health endpoint
- [ ] Check disk space

### Weekly
- [ ] Review access logs
- [ ] Check SSL certificate expiry
- [ ] Review security logs
- [ ] Check for application updates
- [ ] Verify backups are running
- [ ] Review performance metrics

### Monthly
- [ ] Update system packages
- [ ] Update Node.js dependencies
- [ ] Rotate logs manually (if needed)
- [ ] Review and optimize database
- [ ] Test disaster recovery procedure
- [ ] Review and update documentation

---

## 🔄 CI/CD Setup Checklist

### GitHub Actions (Optional)
- [ ] Create `.github/workflows/deploy-ec2.yml`
- [ ] Add GitHub secrets (EC2_HOST, EC2_SSH_KEY)
- [ ] Test deployment workflow
- [ ] Configure branch protection rules
- [ ] Set up automatic testing before deploy

### Deployment Automation
- [ ] Automated backup before deployment
- [ ] Automated database migrations
- [ ] Automated health check after deployment
- [ ] Automated rollback on failure
- [ ] Slack/email notifications on deploy

---

## 📈 Scaling Checklist

### Performance Optimization
- [ ] Enable PM2 cluster mode (multi-process)
- [ ] Configure connection pooling
- [ ] Implement caching (Redis)
- [ ] Optimize database queries
- [ ] Enable Nginx caching
- [ ] Compress responses (gzip)
- [ ] CDN for static assets (optional)

### High Availability
- [ ] Multiple EC2 instances
- [ ] Application Load Balancer configured
- [ ] Auto-scaling group set up
- [ ] Multi-AZ database deployment
- [ ] Database read replicas
- [ ] Session storage in Redis/DynamoDB
- [ ] Health checks configured in ALB

---

## 🐛 Troubleshooting Checklist

### Application Won't Start
- [ ] Check PM2 logs
- [ ] Verify environment variables
- [ ] Check if port is available
- [ ] Verify Node.js version
- [ ] Check file permissions
- [ ] Verify database connection

### Database Connection Issues
- [ ] Test database connection manually
- [ ] Verify database credentials
- [ ] Check security group rules
- [ ] Verify SSL settings
- [ ] Check database is running
- [ ] Verify network connectivity

### Nginx Issues
- [ ] Test Nginx configuration
- [ ] Check Nginx error logs
- [ ] Verify upstream is running
- [ ] Check firewall rules
- [ ] Verify SSL certificate paths
- [ ] Test DNS resolution

---

## 📝 Documentation Checklist

- [ ] API documentation up to date
- [ ] Deployment procedures documented
- [ ] Architecture diagrams created
- [ ] Runbook for common issues
- [ ] Contact information updated
- [ ] Backup/restore procedures documented
- [ ] Disaster recovery plan documented

---

## 🎯 Final Production Readiness

### Critical Requirements (Must Have)
- [x] Application deployed and running
- [x] Database connected and migrations run
- [x] HTTPS enabled with valid certificate
- [x] Health check endpoint responding
- [x] Basic monitoring in place
- [x] Backups configured
- [x] Firewall configured
- [x] Documentation complete

### Recommended Requirements (Should Have)
- [ ] CI/CD pipeline configured
- [ ] Advanced monitoring (CloudWatch, DataDog)
- [ ] Log aggregation (CloudWatch Logs, ELK)
- [ ] Alerting system configured
- [ ] Load balancer configured
- [ ] Auto-scaling configured
- [ ] Disaster recovery tested

### Optional Enhancements (Nice to Have)
- [ ] Multi-region deployment
- [ ] CDN integration
- [ ] Advanced caching layer
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] Compliance certifications

---

## ✅ Sign-Off

### Deployment Team
- **Deployed by:** _________________
- **Date:** _________________
- **Version:** _________________

### Verification
- **Tested by:** _________________
- **Date:** _________________
- **Status:** ☐ Approved  ☐ Issues Found

### Production Approval
- **Approved by:** _________________
- **Date:** _________________
- **Signature:** _________________

---

## 📞 Emergency Contacts

- **DevOps Lead:** _________________
- **Database Admin:** _________________
- **Security Team:** _________________
- **AWS Support:** _________________

---

**🎉 Production Deployment Complete!**

Save this checklist for future deployments and maintenance activities.
