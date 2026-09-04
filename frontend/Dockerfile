# ============================================================
# Stage 1: Build Frontend React + Vite
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================
# Stage 2: Nginx Web Server
# ============================================================
FROM nginx:alpine

# Eliminar configuraciones por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build compilado al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
