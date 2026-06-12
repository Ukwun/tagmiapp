FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --no-package-lock

COPY . .
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "dist/main"]
