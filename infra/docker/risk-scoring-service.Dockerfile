FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY services/risk-scoring-service ./services/risk-scoring-service
RUN npm install --workspace packages/shared --workspace services/risk-scoring-service
RUN npm run build --workspace packages/shared --workspace services/risk-scoring-service
CMD ["node", "services/risk-scoring-service/dist/http.js"]

