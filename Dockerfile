# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001

# Copy built output from builder
COPY --from=builder /app/dist/piktiv ./dist/piktiv
COPY --from=builder /app/package.json ./

# Install production dependencies only (for running the server)
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Switch to non-root user
USER angular

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "dist/piktiv/server/server.mjs"]
