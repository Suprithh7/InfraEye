FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY services/satellite-service ./services/satellite-service
RUN npm install --workspace services/satellite-service
RUN npm run build --workspace services/satellite-service
CMD ["node", "services/satellite-service/dist/http.js"]

