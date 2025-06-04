# WAOK-Schedule - Dockerfile para desarrollo y producción
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat git

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY drizzle.config.ts ./

# Instalar dependencias
RUN npm ci --only=production --silent

# Etapa de desarrollo
FROM base AS development

# Instalar todas las dependencias (incluidas dev)
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV PORT=5000
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/waok_dev
ENV SESSION_SECRET=docker-dev-secret-2024
ENV REPL_ID=docker-dev

# Comando de desarrollo
CMD ["npm", "run", "dev:win"]

# Etapa de construcción
FROM base AS builder

# Instalar dependencias de build
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

# Instalar dependencias mínimas
RUN apk add --no-cache libc6-compat

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 waok

WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cambiar propietario
RUN chown -R waok:nodejs /app
USER waok

# Exponer puerto
EXPOSE 5000

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=5000

# Comando de producción
CMD ["npm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1