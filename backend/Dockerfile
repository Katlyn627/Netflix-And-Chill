# Backend Dockerfile for Netflix and Chill
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (omit dev dependencies in production)
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Expose the port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
