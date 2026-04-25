FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY services/inspection-service ./services/inspection-service
RUN npm install --workspace packages/shared --workspace services/inspection-service
RUN npm run build --workspace packages/shared --workspace services/inspection-service
CMD ["node", "services/inspection-service/dist/http.js"]

