# Multi-stage Dockerfile for Gateway Service
FROM node:20-alpine AS deps
WORKDIR /app/gateway

COPY gateway/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_PATH=/app/gateway/node_modules

COPY --from=deps /app/gateway/node_modules ./gateway/node_modules
COPY gateway/package*.json ./gateway/
COPY gateway/ ./gateway/
COPY shared/ ./shared/

RUN ln -s /app/gateway/node_modules /app/node_modules && \
    chown -R node:node /app

USER node
WORKDIR /app/gateway

EXPOSE 8000

CMD ["node", "index.js"]
