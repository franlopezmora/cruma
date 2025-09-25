# 1) Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Usa el env de producción
RUN npm run build

# 2) NGINX para servir el dist
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Opcional: tu propio config de Nginx para fallback de SPA
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
