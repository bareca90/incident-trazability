# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de desarrollo y compilación
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar código fuente y compilar TypeScript
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ============================================================
# Stage 2: Production Runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar dumb-init para gestión adecuada de señales POSIX
RUN apk add --no-cache dumb-init

# Copiar manifiestos y dependencias de producción
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

# Copiar artefactos compilados desde el builder
COPY --from=builder /app/dist ./dist

# Crear directorio de subidas y asignar permisos al usuario node
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3838

# Verificación de salud
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3838/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
