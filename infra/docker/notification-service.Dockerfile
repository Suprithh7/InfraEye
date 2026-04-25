FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY services/notification-service ./services/notification-service
RUN npm install --workspace services/notification-service
RUN npm run build --workspace services/notification-service
CMD ["node", "services/notification-service/dist/http.js"]
