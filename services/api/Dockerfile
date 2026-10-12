# Build from the repo root so the image can include database/migrations:
#   docker build -f services/api/Dockerfile .
FROM node:24-alpine
WORKDIR /app/services/api
ENV NODE_ENV=production

COPY services/api/package.json services/api/package-lock.json ./
RUN npm ci --omit=dev

COPY services/api/src ./src
COPY database/migrations /app/database/migrations

EXPOSE 3000
USER node
CMD ["node", "src/index.js"]
