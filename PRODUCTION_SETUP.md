# Production Server Setup — Enterprise POS System

Step-by-step guide for setting up a production server from scratch.

---

## Server Requirements

| Component      | Minimum          | Recommended      |
| -------------- | ---------------- | ---------------- |
| CPU            | 2 vCPU           | 4 vCPU           |
| RAM            | 4 GB             | 8 GB             |
| Disk           | 40 GB SSD        | 100 GB SSD       |
| OS             | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker         | 24+              | latest           |
| Docker Compose | v2.20+           | latest           |

---

## Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (logout and re-login after)
sudo usermod -aG docker $USER

# Verify
docker --version
docker compose version
```

---

## Step 2: Configure Firewall

```bash
# Install UFW
sudo apt install ufw -y

# Default policy: deny all incoming, allow all outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL: do this before enabling)
sudo ufw allow ssh

# Allow HTTP and HTTPS (Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify
sudo ufw status verbose
```

> [!CAUTION]
> Always allow SSH before enabling UFW or you will be locked out.

---

## Step 3: Configure SSH Key Access

On your **local machine**:

```bash
# Generate Ed25519 key for CI/CD
ssh-keygen -t ed25519 -C "enterprise-pos-cicd" -f ~/.ssh/pos_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/pos_deploy.pub user@your-server-ip
```

Then add the **private key** (`~/.ssh/pos_deploy`) as the GitHub Secret `PRODUCTION_SSH_KEY`.

---

## Step 4: Set Up Application Directory

```bash
# Create application directory
sudo mkdir -p /opt/enterprise-pos
sudo chown $USER:$USER /opt/enterprise-pos

# Create SSL directory (for future certificates)
mkdir -p /opt/enterprise-pos/docker/nginx/ssl

# Create uploads and backups directories
mkdir -p /opt/enterprise-pos/data/{postgres,redis,uploads,backups}
```

---

## Step 5: Create Production Environment File

```bash
cd /opt/enterprise-pos

# Create the env file (fill in all values)
cat > .env.prod << 'EOF'
# Image versions (will be overwritten by CI/CD)
API_IMAGE=ghcr.io/akramhossain-dev/enterprise-pos-system/api:latest
WEB_IMAGE=ghcr.io/akramhossain-dev/enterprise-pos-system/web:latest

NODE_ENV=production
PORT=4000
APP_NAME=Enterprise POS API
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

DATABASE_URL=postgresql://pos_user:CHANGE_ME@postgres:5432/enterprise_pos
POSTGRES_USER=pos_user
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_DB=enterprise_pos

REDIS_URL=redis://:CHANGE_ME@redis:6379
REDIS_PASSWORD=CHANGE_ME

JWT_SECRET=GENERATE_48_CHAR_HEX
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=GENERATE_ANOTHER_48_CHAR_HEX
REFRESH_TOKEN_EXPIRES_IN=7d
EOF

# Restrict permissions — only owner can read
chmod 600 .env.prod
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Step 6: Copy docker-compose.prod.yml to Server

Either clone the repo or manually copy the file:

```bash
# Option A: Clone (recommended — keep updated with git pull)
git clone https://github.com/akramhossain-dev/Enterprise-POS-System.git /opt/enterprise-pos

# Option B: SCP from local
scp docker-compose.prod.yml user@server:/opt/enterprise-pos/
scp -r docker/ user@server:/opt/enterprise-pos/
```

---

## Step 7: First-Time Database Setup

```bash
cd /opt/enterprise-pos

# Start only the database first
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres redis

# Wait for postgres to be healthy
docker compose -f docker-compose.prod.yml ps

# Run database migrations
docker run --rm \
  --env-file .env.prod \
  --network enterprise-pos_pos-internal \
  ghcr.io/akramhossain-dev/enterprise-pos-system/api:latest \
  sh -c "cd /app/apps/api && npx prisma migrate deploy"
```

---

## Step 8: Start All Services

```bash
cd /opt/enterprise-pos

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verify all containers are healthy
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f api web
```

---

## Step 9: Configure SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot -y

# Obtain certificate (stop Nginx first)
docker compose -f docker-compose.prod.yml stop nginx
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/enterprise-pos/docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/enterprise-pos/docker/nginx/ssl/
sudo chown $USER:$USER /opt/enterprise-pos/docker/nginx/ssl/*

# Uncomment the SSL sections in docker/nginx/nginx.prod.conf
# Then restart Nginx
docker compose -f docker-compose.prod.yml start nginx
```

Auto-renew certificates:

```bash
sudo crontab -e
# Add:
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/*.pem /opt/enterprise-pos/docker/nginx/ssl/ && docker compose -f /opt/enterprise-pos/docker-compose.prod.yml restart nginx
```

---

## Useful Commands

```bash
# View all container status
docker compose -f docker-compose.prod.yml ps

# View logs (follow)
docker compose -f docker-compose.prod.yml logs -f

# Restart a specific service
docker compose -f docker-compose.prod.yml restart api

# Full teardown (CAREFUL — removes containers, not volumes)
docker compose -f docker-compose.prod.yml down

# Database backup
docker exec enterprise-pos-postgres-prod \
  pg_dump -U pos_user enterprise_pos | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```
