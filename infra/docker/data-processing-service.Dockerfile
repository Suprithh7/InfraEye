FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY services/data-processing-service ./services/data-processing-service
RUN npm install --workspace packages/shared --workspace services/data-processing-service
RUN npm run build --workspace packages/shared --workspace services/data-processing-service
CMD ["node", "services/data-processing-service/dist/worker.js"]

