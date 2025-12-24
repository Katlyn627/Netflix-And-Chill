#!/bin/bash

# Integration test script for Netflix and Chill
# Tests backend and frontend setup independently

set -e

echo "🧪 Netflix and Chill - Integration Test Suite"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend package.json exists
echo "📦 Test 1: Checking backend package.json..."
if [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✓ backend/package.json exists${NC}"
else
    echo -e "${RED}✗ backend/package.json not found${NC}"
    exit 1
fi

# Test 2: Check if frontend package.json exists
echo "📦 Test 2: Checking frontend package.json..."
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓ frontend/package.json exists${NC}"
else
    echo -e "${RED}✗ frontend/package.json not found${NC}"
    exit 1
fi

# Test 3: Check if backend Dockerfile exists
echo "🐳 Test 3: Checking backend Dockerfile..."
if [ -f "backend/Dockerfile" ]; then
    echo -e "${GREEN}✓ backend/Dockerfile exists${NC}"
else
    echo -e "${RED}✗ backend/Dockerfile not found${NC}"
    exit 1
fi

# Test 4: Check if frontend Dockerfile exists
echo "🐳 Test 4: Checking frontend Dockerfile..."
if [ -f "frontend/Dockerfile" ]; then
    echo -e "${GREEN}✓ frontend/Dockerfile exists${NC}"
else
    echo -e "${RED}✗ frontend/Dockerfile not found${NC}"
    exit 1
fi

# Test 5: Check if docker-compose.yml exists
echo "🐳 Test 5: Checking docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml exists${NC}"
else
    echo -e "${RED}✗ docker-compose.yml not found${NC}"
    exit 1
fi

# Test 6: Validate docker-compose.yml
echo "🔍 Test 6: Validating docker-compose.yml..."
if docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.yml is invalid${NC}"
    exit 1
fi

# Test 7: Check if backend dependencies can be resolved
echo "📚 Test 7: Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend dependencies not installed (run 'npm run install:backend')${NC}"
fi

# Test 8: Check if frontend dependencies can be resolved
echo "📚 Test 8: Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependencies not installed (run 'npm run install:frontend')${NC}"
fi

# Test 9: Check if backend .env.example exists
echo "⚙️  Test 9: Checking backend .env.example..."
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✓ backend/.env.example exists${NC}"
else
    echo -e "${RED}✗ backend/.env.example not found${NC}"
    exit 1
fi

# Test 10: Check if frontend .env.example exists
echo "⚙️  Test 10: Checking frontend .env.example..."
if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✓ frontend/.env.example exists${NC}"
else
    echo -e "${RED}✗ frontend/.env.example not found${NC}"
    exit 1
fi

# Test 11: Check if DOCKER.md documentation exists
echo "📖 Test 11: Checking Docker documentation..."
if [ -f "DOCKER.md" ]; then
    echo -e "${GREEN}✓ DOCKER.md exists${NC}"
else
    echo -e "${RED}✗ DOCKER.md not found${NC}"
    exit 1
fi

# Test 12: Check if backend README exists
echo "📖 Test 12: Checking backend README..."
if [ -f "backend/README.md" ]; then
    echo -e "${GREEN}✓ backend/README.md exists${NC}"
else
    echo -e "${RED}✗ backend/README.md not found${NC}"
    exit 1
fi

# Test 13: Check if frontend README exists
echo "📖 Test 13: Checking frontend README..."
if [ -f "frontend/README.md" ]; then
    echo -e "${GREEN}✓ frontend/README.md exists${NC}"
else
    echo -e "${RED}✗ frontend/README.md not found${NC}"
    exit 1
fi

# Test 14: Check root package.json scripts
echo "🔧 Test 14: Checking root package.json scripts..."
if grep -q "install:backend" package.json && grep -q "install:frontend" package.json; then
    echo -e "${GREEN}✓ Root package.json has convenience scripts${NC}"
else
    echo -e "${RED}✗ Root package.json missing convenience scripts${NC}"
    exit 1
fi

# Test 15: Check if .gitignore has backend/frontend node_modules
echo "🙈 Test 15: Checking .gitignore..."
if grep -q "backend/node_modules" .gitignore && grep -q "frontend/node_modules" .gitignore; then
    echo -e "${GREEN}✓ .gitignore properly configured${NC}"
else
    echo -e "${RED}✗ .gitignore missing backend/frontend node_modules entries${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Install dependencies: npm run install:all"
echo "  2. Configure backend: cp backend/.env.example backend/.env"
echo "  3. Start with Docker: docker compose up"
echo "     OR start separately:"
echo "     - Backend: npm run start:backend"
echo "     - Frontend: npm run start:frontend"
