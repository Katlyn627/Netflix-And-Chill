# Docker Deployment Guide

This guide covers containerizing and deploying Netflix and Chill using Docker.

## Prerequisites

- Docker installed (https://docs.docker.com/get-docker/)
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### 1. Create Dockerfile

Create `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY backend ./backend
COPY frontend ./frontend

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["node", "backend/server.js"]
```

### 2. Create .dockerignore

```
node_modules
data
.git
.env
*.log
.DS_Store
```

### 3. Build Docker Image

```bash
docker build -t netflix-and-chill:latest .
```

### 4. Run Container

```bash
docker run -d \
  --name netflix-chill \
  -p 3000:3000 \
  -e TMDB_API_KEY=your_api_key \
  -e DB_TYPE=file \
  -v netflix-chill-data:/app/data \
  netflix-and-chill:latest
```

### 5. Access Application

Open http://localhost:3000

## Docker Compose

Create `docker-compose.yml` for easier management:

### File-based Storage

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TMDB_API_KEY=${TMDB_API_KEY}
      - DB_TYPE=file
      - NODE_ENV=production
    volumes:
      - app-data:/app/data
    restart: unless-stopped

volumes:
  app-data:
```

### With MongoDB

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TMDB_API_KEY=${TMDB_API_KEY}
      - DB_TYPE=mongodb
      - MONGODB_URI=mongodb://mongo:27017/netflix-and-chill
      - NODE_ENV=production
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

### With PostgreSQL

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TMDB_API_KEY=${TMDB_API_KEY}
      - DB_TYPE=postgresql
      - PG_HOST=postgres
      - PG_PORT=5432
      - PG_DATABASE=netflix_and_chill
      - PG_USER=postgres
      - PG_PASSWORD=${PG_PASSWORD:-postgres}
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=netflix_and_chill
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${PG_PASSWORD:-postgres}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

### Complete Stack (App + MongoDB + Nginx)

```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - TMDB_API_KEY=${TMDB_API_KEY}
      - DB_TYPE=mongodb
      - MONGODB_URI=mongodb://mongo:27017/netflix-and-chill
      - NODE_ENV=production
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo-data:
```

## Running with Docker Compose

### Start Services

```bash
# Create .env file
echo "TMDB_API_KEY=your_api_key" > .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Update Application

```bash
# Rebuild and restart
docker-compose up -d --build

# Or pull latest changes and restart
git pull
docker-compose up -d --build
```

## Nginx Configuration

Create `nginx.conf` for reverse proxy:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## Production Dockerfile (Multi-stage Build)

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs backend ./backend
COPY --chown=nodejs:nodejs frontend ./frontend
COPY --chown=nodejs:nodejs package*.json ./

# Create data directory
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "backend/server.js"]
```

## Docker Commands

### Manage Containers

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop netflix-chill

# Start container
docker start netflix-chill

# Remove container
docker rm netflix-chill

# View logs
docker logs -f netflix-chill

# Execute command in container
docker exec -it netflix-chill sh
```

### Manage Images

```bash
# List images
docker images

# Remove image
docker rmi netflix-and-chill:latest

# Remove unused images
docker image prune -a
```

### Manage Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect netflix-chill-data

# Remove volume
docker volume rm netflix-chill-data

# Backup volume
docker run --rm -v netflix-chill-data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v netflix-chill-data:/data -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /data
```

## Deploy to Docker Hub

### Build and Push

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag netflix-and-chill:latest yourusername/netflix-and-chill:latest

# Push image
docker push yourusername/netflix-and-chill:latest

# Pull and run on another machine
docker pull yourusername/netflix-and-chill:latest
docker run -d -p 3000:3000 yourusername/netflix-and-chill:latest
```

## Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: netflix-chill
spec:
  replicas: 3
  selector:
    matchLabels:
      app: netflix-chill
  template:
    metadata:
      labels:
        app: netflix-chill
    spec:
      containers:
      - name: app
        image: yourusername/netflix-and-chill:latest
        ports:
        - containerPort: 3000
        env:
        - name: TMDB_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: tmdb-api-key
        - name: DB_TYPE
          value: "mongodb"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
---
apiVersion: v1
kind: Service
metadata:
  name: netflix-chill-service
spec:
  selector:
    app: netflix-chill
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
```

## Environment Variables

Create `.env` file:
```env
TMDB_API_KEY=your_api_key
DB_TYPE=file
PG_PASSWORD=secure_password
MONGODB_URI=mongodb://mongo:27017/netflix-and-chill
NODE_ENV=production
```

Load in Docker Compose:
```bash
docker-compose --env-file .env up -d
```

## Security Best Practices

1. **Don't run as root**: Use non-root user in container
2. **Use secrets**: Don't hardcode sensitive data
3. **Scan images**: Use `docker scan` for vulnerabilities
4. **Keep updated**: Regularly update base images
5. **Limit resources**: Set memory and CPU limits

## Monitoring

### Docker Stats

```bash
docker stats netflix-chill
```

### Health Check

```bash
docker inspect --format='{{.State.Health.Status}}' netflix-chill
```

### Logs

```bash
# Follow logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

## Troubleshooting

### Container won't start
```bash
docker logs netflix-chill
```

### Can't connect to database
```bash
# Check network
docker network inspect <network-name>

# Check if services can reach each other
docker-compose exec app ping mongo
```

### Permission issues
```bash
# Check volume permissions
docker exec netflix-chill ls -la /app/data

# Fix permissions
docker exec -u root netflix-chill chown -R nodejs:nodejs /app/data
```

## Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
