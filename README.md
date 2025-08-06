# Home Server Video Streaming Setup Guide

This guide will help you set up your home server to stream 30+ hours of workout videos for The Bodyweight Gym Online.

## 🖥️ Server Requirements

### Hardware
- **CPU**: Minimum dual-core processor (quad-core recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 100GB+ for video files
- **Network**: Stable broadband connection (50 Mbps upload recommended)

### Software
- Linux (Ubuntu 20.04+ recommended) or Windows Server
- Node.js 14+ and npm
- Nginx (for reverse proxy and caching)
- FFmpeg (for video processing)
- PM2 (for process management)

## 📁 Video File Preparation

### 1. Video Format Optimization

Convert your videos to web-optimized format:

```bash
# Install FFmpeg
sudo apt-get update
sudo apt-get install ffmpeg

# Convert videos to H.264 with web optimization
for file in *.mp4; do
    ffmpeg -i "$file" -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k -movflags +faststart "optimized_$file"
done
```

### 2. Generate Multiple Quality Versions (Optional)

For adaptive streaming:

```bash
# 1080p version
ffmpeg -i input.mp4 -c:v libx264 -crf 22 -preset slow -s 1920x1080 -c:a aac -b:a 128k output_1080p.mp4

# 720p version
ffmpeg -i input.mp4 -c:v libx264 -crf 22 -preset slow -s 1280x720 -c:a aac -b:a 96k output_720p.mp4

# 480p version
ffmpeg -i input.mp4 -c:v libx264 -crf 22 -preset slow -s 854x480 -c:a aac -b:a 64k output_480p.mp4
```

### 3. Generate Thumbnails

```bash
# Generate thumbnail at 10 seconds
ffmpeg -i video.mp4 -ss 00:00:10 -vframes 1 -q:v 2 thumbnail.jpg
```

## 🚀 Server Setup

### 1. Install Node.js Application

```bash
# Clone the repository
git clone https://github.com/yourusername/the-bodyweight-gym-online.git
cd the-bodyweight-gym-online

# Install dependencies
npm install

# Create video directories
mkdir -p videos
mkdir -p public/images/thumbnails
```

### 2. Configure Nginx

Install Nginx:
```bash
sudo apt-get install nginx
```

Create Nginx configuration (`/etc/nginx/sites-available/bodyweightgym`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Video streaming with caching
    location /api/stream/ {
        proxy_pass http://localhost:3000;
        proxy_cache video_cache;
        proxy_cache_valid 200 206 1h;
        proxy_cache_key $uri$is_args$args$slice_range;
        proxy_set_header Range $slice_range;
        
        # Enable video seeking
        proxy_force_ranges on;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Bandwidth optimization
        limit_rate_after 1m;
        limit_rate 500k;
    }

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Cache configuration
proxy_cache_path /var/cache/nginx/videos levels=1:2 keys_zone=video_cache:100m max_size=10g inactive=7d use_temp_path=off;
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bodyweightgym /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name bodyweight-gym

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup

# Monitor the application
pm2 monit
```

### 4. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

## 🔒 Security Configuration

### 1. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 2. Basic DDoS Protection

Add to Nginx configuration:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=video:10m rate=3r/s;

server {
    # Apply rate limiting
    location / {
        limit_req zone=general burst=20 nodelay;
    }
    
    location /api/stream/ {
        limit_req zone=video burst=5;
    }
}
```

### 3. Environment Variables

Create `.env` file:

```env
NODE_ENV=production
PORT=3000
VIDEO_PATH=/home/user/videos
MAX_CONCURRENT_STREAMS=50
CACHE_DURATION=3600
```

## 📊 Monitoring Setup

### 1. System Monitoring

Install monitoring tools:

```bash
# Install htop for system monitoring
sudo apt-get install htop

# Install nethogs for network monitoring
sudo apt-get install nethogs

# Install iotop for disk I/O monitoring
sudo apt-get install iotop
```

### 2. Application Monitoring

Add monitoring endpoint to `server.js`:

```javascript
app.get('/api/health', (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
    },
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});
```

### 3. Log Management

Setup log rotation:

```bash
# Create log directory
mkdir -p /var/log/bodyweightgym

# Configure PM2 logs
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 🌐 Network Optimization

### 1. Enable Compression

Already configured in the Node.js app, but ensure gzip is enabled in Nginx:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
```

### 2. Configure CDN (Optional)

For better global performance, consider using Cloudflare:

1. Sign up for Cloudflare
2. Add your domain
3. Update nameservers
4. Enable caching and optimization features

### 3. Bandwidth Management

Monitor and limit bandwidth usage:

```bash
# Install bandwidth monitoring
sudo apt-get install vnstat

# Initialize vnstat
sudo vnstat -u -i eth0

# View bandwidth usage
vnstat -d
```

## 📱 Mobile Optimization

Ensure videos work well on mobile:

1. Use appropriate video dimensions
2. Enable CORS headers for cross-origin requests
3. Test on various devices and networks

## 🔧 Troubleshooting

### Common Issues

1. **Videos not playing**: Check file permissions and paths
2. **Slow streaming**: Optimize video bitrate and enable caching
3. **High CPU usage**: Consider video transcoding to H.264
4. **Connection drops**: Increase Nginx timeouts

### Debug Commands

```bash
# Check Node.js logs
pm2 logs bodyweight-gym

# Check Nginx errors
sudo tail -f /var/log/nginx/error.log

# Monitor system resources
htop

# Check network connections
netstat -an | grep :3000
```

## 📈 Scaling Considerations

As your platform grows:

1. **Multiple Servers**: Use load balancing with Nginx
2. **Video CDN**: Offload video delivery to specialized CDN
3. **Database**: Move from in-memory to MongoDB/PostgreSQL
4. **Caching**: Implement Redis for session management
5. **Monitoring**: Add comprehensive monitoring with Grafana

## 🎯 Performance Benchmarks

Target performance metrics:

- Page load time: < 2 seconds
- Video start time: < 3 seconds
- Concurrent users: 100+ per server
- Uptime: 99.9%

---

## Support

For additional help:
- Check PM2 documentation: `pm2.keymetrics.io`
- Nginx documentation: `nginx.org/en/docs/`
- Node.js best practices: `nodejs.org/en/docs/guides/`

Remember to regularly update your server software and monitor for security vulnerabilities!