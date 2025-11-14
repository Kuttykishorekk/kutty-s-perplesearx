# Kamal Deployment Guide for Perplefina

## Overview

This guide will help you deploy Perplefina (with SearxNG) using Kamal to your own server.

## Prerequisites

1. **Server Requirements:**
   - Ubuntu/Debian server (or any Linux with Docker)
   - SSH access with sudo privileges
   - Domain name (for SSL) or IP address
   - At least 2GB RAM, 20GB storage

2. **Local Setup:**
   - Ruby 3.0+ (Kamal is installed)
   - Docker (for building images)
   - SSH key access to your server

## Step 1: Configure Deployment

### 1.1 Update `config/deploy.yml`

Edit the following values:

```yaml
servers:
  web:
    - your-server-ip-or-domain.com  # Replace with your server

proxy:
  host: perplefina.your-domain.com  # Replace with your domain

registry:
  username: kutty  # Your Docker Hub username
```

### 1.2 Configure Secrets

Edit `.kamal/secrets` and add your Docker Hub token:

```bash
# Get your Docker Hub access token from:
# https://hub.docker.com/settings/security

KAMAL_REGISTRY_PASSWORD=$DOCKER_HUB_TOKEN
```

## Step 2: Server Setup

### 2.1 SSH into Your Server

```bash
ssh user@your-server-ip
```

### 2.2 Install Docker (if not installed)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Step 3: Deploy

```bash
cd /home/kutty/Github/kutty-s-perplesearx
export PATH="$HOME/.local/share/gem/ruby/3.4.0/bin:$PATH"

# Build, push, and deploy
kamal deploy
```

## Step 4: Update KuttyPulse

Update your KuttyPulse `.env.local`:

```bash
PERPLEFINA_API_URL=https://perplefina.your-domain.com/api/search
```

## Common Commands

```bash
kamal deploy              # Deploy everything
kamal app logs -f         # View logs
kamal app restart         # Restart app
kamal accessory logs searxng -f  # SearxNG logs
```

## Cost: ~$10-25/month (VPS + Domain)
