#!/bin/bash
set -euo pipefail

# ========================================
# PetAI EC2 Bootstrap Script
# Installs Docker, Nginx, pulls images from ECR
# ========================================

echo "=== PetAI EC2 Bootstrap Start ==="

# Variables from Terraform template
AWS_REGION="${aws_region}"
PROJECT="${project_name}"
ENV="${environment}"
SECRET_ARN="${secret_arn}"
BACKEND_ECR="${backend_ecr}"
LINEBOT_ECR="${linebot_ecr}"
DB_ENDPOINT="${db_endpoint}"
DB_NAME="${db_name}"

# ========================================
# Install Docker & Docker Compose
# ========================================
dnf update -y
dnf install -y docker jq nginx certbot python3-certbot-nginx

systemctl enable docker
systemctl start docker

# Install Docker Compose v2
DOCKER_COMPOSE_VERSION="v2.24.0"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-aarch64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Add ec2-user to docker group
usermod -aG docker ec2-user

# ========================================
# ECR Login
# ========================================
aws ecr get-login-password --region $${AWS_REGION} | \
  docker login --username AWS --password-stdin \
  $(echo $${BACKEND_ECR} | cut -d'/' -f1)

# ========================================
# Fetch Secrets from Secrets Manager
# ========================================
SECRETS=$(aws secretsmanager get-secret-value \
  --secret-id "$${SECRET_ARN}" \
  --region "$${AWS_REGION}" \
  --query 'SecretString' --output text)

DATABASE_URL=$(echo $${SECRETS} | jq -r '.DATABASE_URL')
LINE_TOKEN=$(echo $${SECRETS} | jq -r '.LINE_CHANNEL_ACCESS_TOKEN')
LINE_SECRET=$(echo $${SECRETS} | jq -r '.LINE_CHANNEL_SECRET')
OPENAI_KEY=$(echo $${SECRETS} | jq -r '.OPENAI_API_KEY')

# ========================================
# Create .env files
# ========================================
mkdir -p /opt/petai

cat > /opt/petai/.env <<ENVEOF
DATABASE_URL=$${DATABASE_URL}
REDIS_URL=redis://redis:6379/0
LINE_CHANNEL_ACCESS_TOKEN=$${LINE_TOKEN}
LINE_CHANNEL_SECRET=$${LINE_SECRET}
OPENAI_API_KEY=$${OPENAI_KEY}
APP_NAME=PetAI
DEBUG=false
ENVEOF

# ========================================
# Docker Compose for services
# ========================================
cat > /opt/petai/docker-compose.yml <<DCEOF
services:
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s

  backend:
    image: $${BACKEND_ECR}:latest
    restart: always
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s

  line-bot:
    image: $${LINEBOT_ECR}:latest
    restart: always
    ports:
      - "8001:8001"
    env_file: .env
    environment:
      - BACKEND_API_URL=http://backend:8000/api/v1
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 5s

volumes:
  redis_data:
DCEOF

# ========================================
# Nginx reverse proxy configuration
# ========================================
cat > /etc/nginx/conf.d/petai.conf <<NGEOF
server {
    listen 80;
    server_name _;

    # Backend API
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # LINE Bot webhook
    location /webhook {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # Health check
    location /nginx-health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}
NGEOF

# Remove default nginx config
rm -f /etc/nginx/conf.d/default.conf

# Start Nginx
systemctl enable nginx
systemctl start nginx

# ========================================
# Start services
# ========================================
cd /opt/petai
docker compose pull
docker compose up -d

echo "=== PetAI EC2 Bootstrap Complete ==="
