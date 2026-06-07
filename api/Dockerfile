FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/poller/gtfs-realtime.proto ./dist/poller/gtfs-realtime.proto

EXPOSE 3001

CMD ["node", "dist/server.js"]
