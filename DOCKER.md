# Docker Deployment Guide

This guide explains how to deploy Netflix and Chill using Docker and Docker Compose.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 1.29 or higher)

### Installation

**macOS/Windows:**
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Quick Start with Docker Compose

The easiest way to run the entire application:

```bash
# 1. Clone the repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your TMDB API key

# 3. Build and start all services
docker-compose up --build

# Services will be available at:
# - Backend API: http://localhost:3000
# - Frontend: http://localhost:8080
```

## Docker Compose Services

The `docker-compose.yml` file defines the following services:

### Backend Service
- **Image**: Built from `backend/Dockerfile`
- **Port**: 3000
- **Environment**: Configurable via `backend/.env`
- **Volumes**: 
  - `./data:/app/data` - Persistent data storage
  - `./frontend/assets/uploads:/app/uploads` - User uploads

### Frontend Service
- **Image**: Built from `frontend/Dockerfile` (Nginx)
- **Port**: 8080
- **Depends on**: Backend service

### Optional Database Services

MongoDB and PostgreSQL services are included but commented out by default. To enable:

1. Edit `docker-compose.yml`
2. Uncomment the desired database service
3. Update `backend/.env` with database connection settings

## Docker Compose Commands

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Rebuild and start
docker-compose up --build

# Stop and remove all containers, networks, volumes
docker-compose down -v
```

## Using NPM Scripts

For convenience, the root `package.json` includes Docker scripts:

```bash
# Build images
npm run docker:build

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs
```

## Individual Container Deployment

### Backend Only

```bash
# Build backend image
cd backend
docker build -t netflix-and-chill-backend .

# Run backend container
docker run -d \
  --name netflix-backend \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/../data:/app/data \
  netflix-and-chill-backend

# View logs
docker logs -f netflix-backend

# Stop container
docker stop netflix-backend
docker rm netflix-backend
```

### Frontend Only

```bash
# Build frontend image
cd frontend
docker build -t netflix-and-chill-frontend .

# Run frontend container
docker run -d \
  --name netflix-frontend \
  -p 8080:80 \
  netflix-and-chill-frontend

# View logs
docker logs -f netflix-frontend

# Stop container
docker stop netflix-frontend
docker rm netflix-frontend
```

## Using MongoDB with Docker

### Option 1: Docker Compose (Recommended)

Edit `docker-compose.yml` and uncomment the MongoDB service:

```yaml
mongodb:
  image: mongo:6
  container_name: netflix-and-chill-mongodb
  ports:
    - "27017:27017"
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=password
    - MONGO_INITDB_DATABASE=netflix-and-chill
  volumes:
    - mongodb_data:/data/db
  networks:
    - netflix-network
  restart: unless-stopped
```

Uncomment the volume definition at the bottom:
```yaml
volumes:
  mongodb_data:
```

Update `backend/.env`:
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb://admin:password@mongodb:27017/netflix-and-chill?authSource=admin
```

Start services:
```bash
docker-compose up -d
```

### Option 2: Separate MongoDB Container

```bash
# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:6

# Update backend/.env
DB_TYPE=mongodb
MONGODB_URI=mongodb://admin:password@localhost:27017/netflix-and-chill?authSource=admin

# Connect backend to MongoDB network (if using docker-compose)
docker network connect netflix-network mongodb
```

## Using PostgreSQL with Docker

### Option 1: Docker Compose (Recommended)

Edit `docker-compose.yml` and uncomment the PostgreSQL service:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: netflix-and-chill-postgres
  ports:
    - "5432:5432"
  environment:
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=password
    - POSTGRES_DB=netflix_and_chill
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - netflix-network
  restart: unless-stopped
```

Uncomment the volume definition:
```yaml
volumes:
  postgres_data:
```

Update `backend/.env`:
```env
DB_TYPE=postgresql
POSTGRESQL_URI=postgresql://postgres:password@postgres:5432/netflix_and_chill
```

Start services:
```bash
docker-compose up -d
```

### Option 2: Separate PostgreSQL Container

```bash
# Run PostgreSQL container
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=netflix_and_chill \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Update backend/.env
DB_TYPE=postgresql
POSTGRESQL_URI=postgresql://postgres:password@localhost:5432/netflix_and_chill

# Connect backend to PostgreSQL network (if using docker-compose)
docker network connect netflix-network postgres
```

## Environment Variables

### Backend Environment
Create `backend/.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (choose one)
DB_TYPE=file
# DB_TYPE=mongodb
# DB_TYPE=postgresql

# MongoDB (if using)
MONGODB_URI=mongodb://admin:password@mongodb:27017/netflix-and-chill?authSource=admin

# PostgreSQL (if using)
POSTGRESQL_URI=postgresql://postgres:password@postgres:5432/netflix_and_chill

# APIs
TMDB_API_KEY=your_tmdb_api_key_here
WATCHMODE_API_KEY=your_watchmode_api_key_here

# Optional services
STREAM_CHAT_API_KEY=your_stream_chat_api_key
STREAM_CHAT_API_SECRET=your_stream_chat_secret
```

## Production Deployment

### Security Best Practices

1. **Use secrets management**:
   - Don't commit `.env` files
   - Use Docker secrets or environment variables
   - Use strong passwords for databases

2. **Update docker-compose.yml for production**:
   ```yaml
   backend:
     environment:
       - NODE_ENV=production
     restart: always
   ```

3. **Use reverse proxy (Nginx/Traefik)**:
   - Terminate SSL/TLS
   - Load balancing
   - Rate limiting

4. **Enable HTTPS**:
   - Use Let's Encrypt certificates
   - Configure SSL in reverse proxy

### Example with Traefik

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.email=your@email.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.tlschallenge=true"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./letsencrypt:/letsencrypt
    networks:
      - netflix-network

  backend:
    build: ./backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=le"
    networks:
      - netflix-network

  frontend:
    build: ./frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=le"
    networks:
      - netflix-network

networks:
  netflix-network:
    driver: bridge
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8080

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Map host 3001 to container 3000
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a

# Remove and rebuild
docker-compose down
docker-compose up --build
```

### Database Connection Issues

```bash
# Check if database is running
docker ps | grep mongo
docker ps | grep postgres

# Test connection from backend container
docker exec -it netflix-and-chill-backend sh
# Inside container:
ping mongodb
# or
ping postgres
```

### Volume Permission Issues

If you encounter permission issues with volumes:

```bash
# Fix ownership
sudo chown -R $USER:$USER ./data
sudo chown -R $USER:$USER ./frontend/assets/uploads
```

## Updating

To update the application:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

## Backup and Restore

### Backup Data

```bash
# Backup file-based data
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Backup MongoDB
docker exec netflix-and-chill-mongodb mongodump --out=/backup
docker cp netflix-and-chill-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)

# Backup PostgreSQL
docker exec netflix-and-chill-postgres pg_dump -U postgres netflix_and_chill > backup-$(date +%Y%m%d).sql
```

### Restore Data

```bash
# Restore file-based data
tar -xzf backup-YYYYMMDD.tar.gz

# Restore MongoDB
docker cp ./mongodb-backup-YYYYMMDD netflix-and-chill-mongodb:/backup
docker exec netflix-and-chill-mongodb mongorestore /backup

# Restore PostgreSQL
cat backup-YYYYMMDD.sql | docker exec -i netflix-and-chill-postgres psql -U postgres netflix_and_chill
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Main README](../README.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
