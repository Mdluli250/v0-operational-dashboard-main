# Server Deployment Guide - 146.64.52.234

Complete instructions for deploying the Operational KPI Dashboard to your production server.

## Server Information

- **IP Address**: 146.64.52.234
- **Application Port**: 3000 (default, configurable)
- **Recommended OS**: Ubuntu 20.04+ or CentOS 8+
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space

## Step 1: SSH Access to Server

```bash
# Connect to your server
ssh user@146.64.52.234

# Or with specific key
ssh -i /path/to/private/key user@146.64.52.234

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Node.js and pnpm

### Option A: Using NodeSource Repository (Ubuntu/Debian)

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # v18.x.x
npm --version

# Install pnpm globally
sudo npm install -g pnpm

# Verify pnpm
pnpm --version
```

### Option B: Using NVM (Node Version Manager)

```bash
# Download and install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18

# Install pnpm
npm install -g pnpm
```

## Step 3: Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/kpi-dashboard
cd /var/www/kpi-dashboard

# Set proper permissions
sudo chown -R $USER:$USER /var/www/kpi-dashboard
```

## Step 4: Clone or Copy Application

### Option A: Git Clone (if available)

```bash
cd /var/www/kpi-dashboard
git clone <your-git-repository> .
git checkout main
```

### Option B: Copy from Local Machine

```bash
# From your local machine, use SCP
scp -r /path/to/local/v0-project/* user@146.64.52.234:/var/www/kpi-dashboard/

# Or use rsync for better handling of large files
rsync -avz --delete /path/to/local/v0-project/ user@146.64.52.234:/var/www/kpi-dashboard/
```

## Step 5: Install Dependencies

```bash
cd /var/www/kpi-dashboard

# Install all dependencies
pnpm install

# Verify installation
pnpm list | head -20
```

## Step 6: Configure Environment Variables

```bash
# Create environment file
nano .env.local
```

Add the following configuration:

```env
# Azure AD Configuration
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=37b3b438-b221-4000-870e-e512c7718345
AZURE_AD_CLIENT_SECRET=OrqI8Q~KkbTR9hqj7EnOnV4IjKDhMyzUkPvQqrbpu
AZURE_AD_TENANT_ID=1efd3c5d5-ddb2-4ed3-9803-f89675928df4

# NextAuth Configuration
NEXTAUTH_URL=http://146.64.52.234:3000
NEXTAUTH_SECRET=<generate-using-command-below>

# SharePoint Configuration (Update with your values)
NEXT_PUBLIC_SHAREPOINT_SITE_ID=<your-sharepoint-site-id>
NEXT_PUBLIC_SHAREPOINT_LIST_ID=<your-kpi-list-id>

# Application Port
PORT=3000
NODE_ENV=production
```

### Generate NEXTAUTH_SECRET

```bash
# Generate a strong secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste into .env.local for NEXTAUTH_SECRET
```

Save the file: `Ctrl+X`, then `Y`, then `Enter`

## Step 7: Build Application

```bash
cd /var/www/kpi-dashboard

# Build for production
pnpm build

# This creates the .next directory with optimized code
```

## Step 8: Set Up Systemd Service (Recommended for Auto-Start)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/kpi-dashboard.service
```

Add the following content:

```ini
[Unit]
Description=KPI Dashboard Application
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=<your-username>
WorkingDirectory=/var/www/kpi-dashboard
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/home/<your-username>/.local/share/pnpm/pnpm start
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/kpi-dashboard/app.log
StandardError=append:/var/log/kpi-dashboard/error.log

[Install]
WantedBy=multi-user.target
```

**Important**: Replace `<your-username>` with your actual username.

Enable and start the service:

```bash
# Create log directory
sudo mkdir -p /var/log/kpi-dashboard
sudo chown $USER:$USER /var/log/kpi-dashboard

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable kpi-dashboard.service

# Start the service
sudo systemctl start kpi-dashboard.service

# Check status
sudo systemctl status kpi-dashboard.service

# View logs
tail -f /var/log/kpi-dashboard/app.log
```

## Step 9: Set Up Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/kpi-dashboard
```

Add the following configuration:

```nginx
upstream kpi_dashboard {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    
    server_name 146.64.52.234;
    
    # Redirect HTTP to HTTPS (uncomment after SSL is set up)
    # return 301 https://$server_name$request_uri;
    
    client_max_body_size 20M;
    
    location / {
        proxy_pass http://kpi_dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1000;
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/kpi-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable on boot
sudo systemctl enable nginx
```

## Step 10: Set Up SSL Certificate (Optional but Recommended for HTTPS)

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d 146.64.52.234

# Update Nginx configuration to use SSL
sudo nano /etc/nginx/sites-available/kpi-dashboard
```

Update the Nginx config to include SSL:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name 146.64.52.234;
    
    ssl_certificate /etc/letsencrypt/live/146.64.52.234/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/146.64.52.234/privkey.pem;
    
    # Rest of configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name 146.64.52.234;
    return 301 https://$server_name$request_uri;
}
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

## Step 11: Verify Deployment

```bash
# Check if application is running
curl http://146.64.52.234:3000

# Check systemd service status
sudo systemctl status kpi-dashboard.service

# View application logs
tail -f /var/log/kpi-dashboard/app.log

# Check Nginx is working
curl http://146.64.52.234

# Monitor resource usage
top
htop  # if installed
```

## Step 12: Configure Firewall (UFW)

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP
sudo ufw allow 80

# Allow HTTPS
sudo ufw allow 443

# Check rules
sudo ufw status
```

## Monitoring and Maintenance

### View Application Logs

```bash
# Real-time logs
tail -f /var/log/kpi-dashboard/app.log

# Last 100 lines
tail -100 /var/log/kpi-dashboard/app.log

# Filter errors
grep "ERROR" /var/log/kpi-dashboard/error.log
```

### Restart Application

```bash
# Restart service
sudo systemctl restart kpi-dashboard.service

# Stop service
sudo systemctl stop kpi-dashboard.service

# Start service
sudo systemctl start kpi-dashboard.service
```

### Update Application

```bash
cd /var/www/kpi-dashboard

# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
pnpm install

# Rebuild
pnpm build

# Restart service
sudo systemctl restart kpi-dashboard.service
```

### Monitor System Resources

```bash
# Real-time monitoring
htop

# Check disk space
df -h

# Check memory usage
free -m

# Check application process
ps aux | grep "pnpm start"
```

## Troubleshooting

### Application Won't Start

```bash
# Check service status
sudo systemctl status kpi-dashboard.service

# View detailed logs
sudo journalctl -u kpi-dashboard.service -n 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Connection Issues

```bash
# Test connectivity
curl -v http://146.64.52.234:3000

# Check Nginx
sudo nginx -t
sudo systemctl restart nginx

# Check firewall
sudo ufw status
```

### Performance Issues

```bash
# Check CPU usage
top -o %CPU

# Check memory
free -h

# Check disk I/O
iostat -x 1

# Increase Node.js memory if needed
export NODE_OPTIONS=--max-old-space-size=4096
```

## Security Checklist

- [ ] Update system packages regularly
- [ ] Use strong passwords
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Regular backups of configuration
- [ ] Monitor logs for suspicious activity
- [ ] Keep Node.js and dependencies updated
- [ ] Restrict SSH access (consider key-only auth)
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Never commit .env.local to version control

## Backup and Recovery

### Create Backup Script

```bash
#!/bin/bash
BACKUP_DIR="/backups/kpi-dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration and data
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz \
    /var/www/kpi-dashboard/.env.local \
    /var/www/kpi-dashboard/.next

echo "Backup completed: $BACKUP_DIR/backup_$DATE.tar.gz"
```

Save as `/var/www/kpi-dashboard/backup.sh` and make executable:

```bash
chmod +x /var/www/kpi-dashboard/backup.sh

# Run backup
./backup.sh

# Schedule daily backups (add to crontab)
crontab -e

# Add this line:
# 0 2 * * * /var/www/kpi-dashboard/backup.sh
```

## Access Dashboard

Once deployed, access your dashboard at:

- **HTTP**: http://146.64.52.234
- **HTTPS**: https://146.64.52.234 (if SSL configured)

The application will:
1. Load the login page
2. Redirect to Azure AD for authentication
3. Load dashboard with your KPI data

## Support and Additional Notes

- Application runs on port 3000 internally, accessible via Nginx on port 80/443
- Logs are stored in `/var/log/kpi-dashboard/`
- Configuration is in `/var/www/kpi-dashboard/.env.local`
- Application code is in `/var/www/kpi-dashboard/`
- Service auto-starts on server reboot

For troubleshooting, check logs first, then review environment variables and network connectivity.
