# RetroBreaker - Docker Deployment Guide

This guide explains how to deploy RetroBreaker using Docker and Dokploy.

## Prerequisites

- Docker and Docker Compose installed
- Dokploy setup with Traefik as reverse proxy
- Domain name configured (replace `retrobreaker.yourdomain.com` in docker-compose.yml)

## Environment Variables

Before deploying, set these environment variables in Dokploy:

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/retrobreaker.db
JWT_SECRET=your-super-secret-jwt-key-here
GROQ_API_KEY=your-groq-api-key-here
```

## Deployment Steps

### 1. Update Domain Name

Edit `docker-compose.yml` and replace `retrobreaker.yourdomain.com` with your actual domain:

```yaml
# Lines to update:
- "traefik.http.routers.retrobreaker-api.rule=Host(`YOUR_DOMAIN`) && PathPrefix(`/api`)"
- "traefik.http.routers.retrobreaker-app.rule=Host(`YOUR_DOMAIN`)"
```

### 2. Deploy with Dokploy

1. Create a new project in Dokploy
2. Connect your Git repository
3. Add the environment variables listed above
4. Dokploy will automatically detect the `docker-compose.yml` and deploy

### 3. Local Testing (Optional)

To test the Docker setup locally before deploying:

```bash
# Build images
docker-compose build

# Run containers (without Traefik labels)
docker-compose up -d

# Check logs
docker-compose logs -f

# Access locally:
# - Frontend: http://localhost:80
# - Backend: http://localhost:3000
```

## Architecture

```
┌─────────────────┐
│   Traefik       │ (Dokploy reverse proxy)
│   (SSL/HTTPS)   │
└────────┬────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
┌───▼──────────────┐   ┌──────▼────────────┐
│  Frontend        │   │  Backend API      │
│  (Nginx/React)   │   │  (Node.js/Express)│
│  Port: 80        │   │  Port: 3000       │
└──────────────────┘   └───────┬───────────┘
                               │
                       ┌───────▼──────────┐
                       │  SQLite Database │
                       │  (Volume)        │
                       └──────────────────┘
```

## Services

### Backend (`retrobreaker-backend`)
- Node.js 20 Alpine
- Express API server
- SQLite database (persistent volume)
- Health check: `/api/health`
- Port: 3000 (internal)

### Frontend (`retrobreaker-frontend`)
- Nginx Alpine
- Expo Web build (static files)
- SPA routing support
- Port: 80 (internal)

## Persistent Data

The SQLite database is stored in a Docker volume named `retrobreaker-data`:

```bash
# Backup database
docker run --rm -v retrobreaker-data:/data -v $(pwd):/backup alpine tar czf /backup/retrobreaker-backup.tar.gz -C /data .

# Restore database
docker run --rm -v retrobreaker-data:/data -v $(pwd):/backup alpine tar xzf /backup/retrobreaker-backup.tar.gz -C /data
```

## Troubleshooting

### Check container logs
```bash
docker-compose logs retrobreaker-backend
docker-compose logs retrobreaker-frontend
```

### Access backend container
```bash
docker-compose exec retrobreaker-backend sh
```

### Verify health check
```bash
curl http://localhost:3000/api/health
```

### Rebuild after changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Security Notes

1. **Never commit secrets**: Use Dokploy environment variables for sensitive data
2. **Update JWT_SECRET**: Generate a strong random secret
3. **SQLite permissions**: The volume is only accessible within the container
4. **HTTPS only**: Traefik handles SSL certificates via Let's Encrypt

## Monitoring

The backend includes a health check endpoint that Dokploy/Docker uses to monitor service health:
- Endpoint: `GET /api/health`
- Interval: 30s
- Timeout: 10s
- Retries: 3

Traefik dashboard (if enabled in Dokploy) will show:
- Service status
- SSL certificate status
- Request metrics
