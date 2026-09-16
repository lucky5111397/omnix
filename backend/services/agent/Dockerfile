# Multi-stage Dockerfile for Agent Service
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create runtime directories for uploads/generated files and ensure node user ownership
RUN mkdir -p /app/uploads /app/generated && chown -R node:node /app

USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

EXPOSE 8003

CMD ["node", "index.js"]
