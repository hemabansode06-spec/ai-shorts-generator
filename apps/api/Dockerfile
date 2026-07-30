# syntax=docker/dockerfile:1

FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production=false || npm install

# Copy sources
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build
RUN npx prisma generate || true
RUN npm run build || true

# Final image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json and production deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/server.js"]
