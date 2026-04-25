FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway
COPY data ./data
RUN npm install --workspace packages/shared --workspace services/api-gateway
RUN npm run build --workspace packages/shared --workspace services/api-gateway
CMD ["node", "services/api-gateway/dist/server.js"]

