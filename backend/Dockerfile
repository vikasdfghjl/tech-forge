# Build stage
FROM node:22-alpine3.20 AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies more efficiently
RUN npm ci

# Copy only necessary source files
COPY tsconfig.json ./
COPY server.ts ./
COPY config/ ./config/
COPY controllers/ ./controllers/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY routes/ ./routes/
COPY types/ ./types/
COPY utils/ ./utils/

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine3.20 AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Use non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set environment variables
ENV NODE_ENV=production

EXPOSE 5000

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]