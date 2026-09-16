# Multi-stage Dockerfile for Auth Service
FROM node:20-alpine AS deps
WORKDIR /app/services/auth

COPY services/auth/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_PATH=/app/services/auth/node_modules

COPY --from=deps /app/services/auth/node_modules ./services/auth/node_modules
COPY services/auth/package*.json ./services/auth/
COPY services/auth/ ./services/auth/
COPY shared/ ./shared/

RUN ln -s /app/services/auth/node_modules /app/node_modules && \
    chown -R node:node /app

USER node
WORKDIR /app/services/auth

EXPOSE 8001

CMD ["node", "index.js"]
