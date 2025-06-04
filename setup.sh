#!/bin/bash

# WAOK-Schedule - Setup Script para Unix/Linux/Mac
# Hace el proyecto portable entre diferentes sistemas operativos

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  🚀 WAOK-Schedule - Setup Automático${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
}

print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main setup process
print_header

# Step 1: Check Node.js
print_step "[1/8] Verificando Node.js..."
if check_command node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js detectado: $NODE_VERSION"
else
    print_error "Node.js no está instalado"
    echo "Por favor instala Node.js 18+ desde: https://nodejs.org/"
    exit 1
fi

# Step 2: Check npm
print_step "[2/8] Verificando npm..."
if check_command npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm detectado: $NPM_VERSION"
else
    print_error "npm no está disponible"
    exit 1
fi

# Step 3: Clean problematic caches
print_step "[3/8] Limpiando caches problemáticos..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .next 2>/dev/null || true
rm -rf coverage 2>/dev/null || true
rm -rf dist 2>/dev/null || true
print_success "Caches limpiados"

# Step 4: Backup package-lock if exists
print_step "[4/8] Preparando instalación..."
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.backup 2>/dev/null || true
    print_success "package-lock.json respaldado"
fi
print_success "Preparación completada"

# Step 5: Install base dependencies
print_step "[5/8] Instalando dependencias base..."
echo "Por favor espera, esto puede tomar varios minutos..."
if npm install --force --silent --no-audit --prefer-offline; then
    print_success "Dependencias base instaladas"
else
    print_warning "Instalación estándar falló, intentando modo legacy..."
    if npm install --legacy-peer-deps --silent; then
        print_success "Dependencias instaladas en modo legacy"
    else
        print_error "ERROR CRÍTICO: No se pudieron instalar las dependencias"
        exit 1
    fi
fi

# Step 6: Install critical dependencies
print_step "[6/8] Instalando dependencias críticas..."
CRITICAL_DEPS=("drizzle-zod" "cross-env" "tsx" "rimraf" "esbuild")
for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" >/dev/null 2>&1; then
        print_success "$dep ya instalado"
    else
        echo "Instalando $dep..."
        if npm install "$dep" --save --no-audit --silent; then
            print_success "$dep instalado"
        else
            print_warning "Falló instalación de $dep"
        fi
    fi
done

# Step 7: Configure .env.local
print_step "[7/8] Configurando variables de entorno..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# WAOK-Schedule - Configuración Local de Desarrollo
# Generado automáticamente por setup.sh

DATABASE_URL=postgresql://dummy:dummy@localhost:5432/waok_dev
NODE_ENV=development
PORT=5000
SESSION_SECRET=dev-secret-waok-2024-auto
REPL_ID=local-dev-unix
VITE_APP_TITLE=WAOK Schedule - Local Dev
VITE_API_BASE_URL=http://localhost:5000

# Para base de datos real, reemplazar DATABASE_URL
# DATABASE_URL=postgres://user:pass@host/db?sslmode=require
EOF
    print_success "Archivo .env.local creado"
else
    print_success "Archivo .env.local ya existe"
fi

# Step 8: Final verification
print_step "[8/8] Verificación final del sistema..."
echo "Verificando TypeScript..."
if npx tsc --version >/dev/null 2>&1; then
    print_success "TypeScript verificado"
else
    print_warning "TypeScript no detectado globalmente"
fi

echo "Verificando tsx..."
if npx tsx --version >/dev/null 2>&1; then
    print_success "tsx verificado"
else
    print_warning "tsx no funciona correctamente, reinstalando..."
    npm install tsx --save-dev --silent
fi

print_success "Verificación completada"

echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 SETUP COMPLETADO EXITOSAMENTE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo -e "${BLUE}📋 PRÓXIMOS PASOS:${NC}"
echo
echo "1. Para iniciar el servidor inmediatamente:"
echo -e "   ${YELLOW}npm run start:fast${NC}"
echo
echo "2. Para desarrollo continuo:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo
echo "3. Para verificar que todo funciona:"
echo -e "   ${YELLOW}npm run check:quick${NC}"
echo
echo -e "${BLUE}🌐 URLs disponibles después del inicio:${NC}"
echo "   • Aplicación: http://localhost:5000"
echo "   • API: http://localhost:5000/api"
echo "   • Health Check: http://localhost:5000/health"
echo
echo -e "${BLUE}🐳 Para usar Docker:${NC}"
echo -e "   ${YELLOW}docker-compose up -d${NC}"
echo
echo -e "${BLUE}📝 Para más información, consulta INICIO-RAPIDO.md${NC}"
echo
echo -e "${GREEN}========================================${NC}"
echo
read -p "¿Deseas iniciar el servidor ahora? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo
    echo "Iniciando servidor..."
    npm run start:fast
else
    echo
    echo "Setup completado. Ejecuta 'npm run start:fast' cuando estés listo."
fi