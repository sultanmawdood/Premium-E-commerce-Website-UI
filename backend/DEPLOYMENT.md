# KingSports API - Production Deployment Guide

## 🚀 Quick Start

This guide covers deploying the KingSports e-commerce API to production with Docker, monitoring, and security best practices.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **CPU**: 2+ cores
- **Storage**: 20GB+ SSD
- **Network**: Static IP with ports 80, 443, 22 open

### Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Node.js (for local development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

## 🔧 Environment Setup

### 1. Create Deployment User
```bash
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy
```

### 2. Setup SSH Keys
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "deploy@kingsports.com"
ssh-copy-id deploy@your-server-ip
```

### 3. Configure Environment Variables
```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kingsports
REDIS_HOST=redis
REDIS_PASSWORD=your_secure_redis_password
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_at_least_32_characters_long
FRONTEND_URL=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
```

## 🐳 Docker Deployment

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/kingsports-api.git
cd kingsports-api/backend
```

### 2. Build and Start Services
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Initialize Database
```bash
# Run database initialization
docker-compose exec mongo mongosh --eval "load('/docker-entrypoint-initdb.d/mongo-init.js')"

# Seed initial data (optional)
docker-compose exec kingsports-api npm run seed
```

## 🌐 Nginx Configuration

### 1. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

### 2. Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/kingsports-api
sudo ln -s /etc/nginx/sites-available/kingsports-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 📊 Monitoring Setup

### 1. Prometheus & Grafana
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana at http://your-server:3001
# Default login: admin/admin
```

### 2. Log Monitoring
```bash
# View application logs
docker-compose logs -f kingsports-api

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Health Checks
```bash
# API health check
curl https://api.yourdomain.com/api/health

# Database health
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Redis health
docker-compose exec redis redis-cli ping
```

## 🔒 Security Configuration

### 1. Firewall Setup
```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Allow monitoring (restrict to your IP)
sudo ufw allow from YOUR_IP to any port 3001
sudo ufw allow from YOUR_IP to any port 9090
```

### 2. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure for Nginx
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl restart fail2ban
```

### 3. Database Security
```bash
# MongoDB security
docker-compose exec mongo mongosh admin --eval "
db.createUser({
  user: 'admin',
  pwd: 'your_secure_password',
  roles: ['userAdminAnyDatabase', 'dbAdminAnyDatabase']
})
"
```

## 🔄 CI/CD Setup

### 1. GitHub Actions Secrets
Add these secrets to your GitHub repository:

```
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=your-private-ssh-key
PRODUCTION_URL=https://api.yourdomain.com
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

### 2. Automated Deployment
The CI/CD pipeline will automatically:
- Run tests on pull requests
- Build Docker images on push to main
- Deploy to production on successful build
- Run health checks post-deployment

## 📈 Performance Optimization

### 1. Database Optimization
```bash
# MongoDB performance tuning
docker-compose exec mongo mongosh kingsports --eval "
db.runCommand({
  collMod: 'products',
  index: {
    keyPattern: { category: 1, price: 1 },
    background: true
  }
})
"
```

### 2. Redis Configuration
```bash
# Optimize Redis memory
docker-compose exec redis redis-cli CONFIG SET maxmemory 256mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Node.js Optimization
```bash
# Set Node.js production flags
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 🔧 Maintenance

### 1. Backup Strategy
```bash
# Automated backup script
chmod +x backup.sh
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/kingsports-production/backup.sh
```

### 2. Log Rotation
```bash
# Setup log rotation
sudo tee /etc/logrotate.d/kingsports > /dev/null <<EOF
/opt/kingsports-production/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    postrotate
        docker-compose -f /opt/kingsports-production/docker-compose.yml restart kingsports-api
    endscript
}
EOF
```

### 3. Updates
```bash
# Update application
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## 🚨 Troubleshooting

### Common Issues

**1. Container Won't Start**
```bash
# Check logs
docker-compose logs kingsports-api

# Check resource usage
docker stats

# Restart services
docker-compose restart
```

**2. Database Connection Issues**
```bash
# Check MongoDB status
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Check network connectivity
docker-compose exec kingsports-api ping mongo
```

**3. High Memory Usage**
```bash
# Monitor memory
free -h
docker stats

# Restart if needed
docker-compose restart kingsports-api
```

**4. SSL Certificate Issues**
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## 📞 Support

### Monitoring Endpoints
- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`
- **Grafana**: `http://your-server:3001`
- **Prometheus**: `http://your-server:9090`

### Log Locations
- **Application**: `/opt/kingsports-production/logs/`
- **Nginx**: `/var/log/nginx/`
- **System**: `/var/log/syslog`

### Emergency Procedures
1. **Service Down**: Run `docker-compose restart`
2. **Database Issues**: Check MongoDB logs and restart if needed
3. **High Load**: Scale horizontally or increase resources
4. **Security Breach**: Immediately rotate secrets and check logs

## 🎯 Performance Benchmarks

### Expected Performance
- **Response Time**: < 200ms (95th percentile)
- **Throughput**: 1000+ requests/second
- **Uptime**: 99.9%
- **Memory Usage**: < 512MB per container

### Load Testing
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

This deployment guide ensures your KingSports API is production-ready with enterprise-level security, monitoring, and scalability.