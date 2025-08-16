# Multi-stage build for sample-app single container deployment
FROM node:18-alpine AS base

# Install dependencies for building
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd server && npm ci --only=production && npm cache clean --force
RUN cd client && npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build stage for client
FROM base AS client-builder
WORKDIR /app/client
RUN npm run build

# Production stage
FROM base AS production

# Copy built client from builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the standalone server
CMD ["npm", "run", "start:standalone"] 