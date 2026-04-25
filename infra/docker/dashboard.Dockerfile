FROM node:20-alpine AS build
WORKDIR /app
COPY apps/dashboard ./apps/dashboard
RUN cd apps/dashboard && npm install && npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html

