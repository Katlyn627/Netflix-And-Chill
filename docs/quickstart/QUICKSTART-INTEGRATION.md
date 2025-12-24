# Quick Start Guide

This is a quick reference for getting started with the Netflix and Chill app after the repository integration.

## 🚀 Fastest Way to Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill

# 2. Configure backend
cp backend/.env.sample backend/.env
# Edit backend/.env and add your TMDB API key

# 3. Start everything with Docker
docker-compose up --build

# 4. Access the app
# Backend API: http://localhost:3000
# Frontend: http://localhost:8080
```

## 💻 Manual Setup (Without Docker)

```bash
# 1. Clone the repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill

# 2. Install all dependencies
npm run install:all

# 3. Configure backend
cp backend/.env.sample backend/.env
# Edit backend/.env and add your TMDB API key

# 4. Start backend (Terminal 1)
npm run start:backend

# 5. Start frontend (Terminal 2)
npm run start:frontend

# 6. Access the app
# Backend API: http://localhost:3000
# Frontend: http://localhost:8080
```

## 📦 Available Commands

### Installation
```bash
npm run install:all          # Install backend + frontend + mobile
npm run install:backend      # Install backend only
npm run install:frontend     # Install frontend only
npm run install:mobile       # Install mobile only
```

### Development
```bash
npm run start:backend        # Start backend server
npm run start:frontend       # Start frontend dev server
npm run dev:backend          # Backend with nodemon
npm run dev:frontend         # Frontend with live reload
```

### Docker
```bash
npm run docker:build         # Build all images
npm run docker:up            # Start all services
npm run docker:down          # Stop all services
npm run docker:logs          # View logs
```

### Database Seeding
```bash
npm run seed                 # Seed 100 test users
npm run seed:mongodb         # Seed with MongoDB
npm run seed:matches         # Seed matches
npm run seed:all             # Seed users + matches
```

## 🔧 Component-Specific Commands

### Backend
```bash
cd backend
npm install                  # Install dependencies
npm start                    # Start server
npm run seed                 # Seed database
```

### Frontend
```bash
cd frontend
npm install                  # Install dependencies
npm start                    # Start dev server
```

### Mobile
```bash
cd mobile
npm install                  # Install dependencies
npm start                    # Start Expo
npm run android             # Run on Android
npm run ios                 # Run on iOS
```

## 📚 Documentation

- [Main README](README.md) - Complete project documentation
- [Backend README](backend/README.md) - Backend API documentation
- [Frontend README](frontend/README.md) - Frontend documentation
- [DOCKER.md](DOCKER.md) - Docker deployment guide
- [INTEGRATION.md](INTEGRATION.md) - Repository integration details
- [API.md](API.md) - API reference
- [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md) - How to get API keys

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change backend port
cd backend
PORT=3001 npm start

# Change frontend port
cd frontend
npx http-server . -p 8081
```

### Dependencies Won't Install
```bash
# Clean and reinstall
rm -rf backend/node_modules frontend/node_modules
npm run install:all
```

### Docker Issues
```bash
# Clean Docker cache
docker system prune -a
docker-compose build --no-cache
```

### API Connection Issues
- Check backend is running on port 3000
- Verify `frontend/src/services/api.js` has correct API URL
- Check browser console for errors

## 🆘 Need Help?

1. Check the [Main README](README.md)
2. Read component-specific READMEs
3. Review [INTEGRATION.md](INTEGRATION.md)
4. Check existing issues on GitHub

## ✅ Verify Your Setup

Run the integration test suite:
```bash
./test-integration.sh
```

This will verify:
- All package.json files exist
- All Dockerfiles exist
- docker-compose.yml is valid
- Dependencies are installable
- Environment examples exist
- Documentation is complete

All tests should pass! ✅
