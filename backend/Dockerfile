FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
RUN npm install --production --ignore-scripts --prefer-offline
EXPOSE 5000
CMD ["npm", "run", "start:prod"]
