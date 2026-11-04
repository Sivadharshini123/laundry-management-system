# Multi-stage Dockerfile for Campus Laundry Service
# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS server
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production
COPY server/ ./
COPY docs/ /app/docs/
COPY --from=client-builder /app/client/dist /app/client/dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/index.js"]
