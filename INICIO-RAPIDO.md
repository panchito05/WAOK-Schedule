# 🚀 WAOK-Schedule - Inicio Rápido

## ⚡ INICIALIZACIÓN DEFINITIVA (Método más rápido)

### 🚀 UN SOLO COMANDO - SOLUCIONA TODO:
```bash
# NUEVO: Script de inicialización ultra-rápida (Windows)
init.bat

# Con opciones:
init.bat --force        # Reinstalación completa
init.bat --no-server    # Solo setup, sin servidor
init.bat --help         # Ver todas las opciones
```

## ⚡ Inicialización Automática Avanzada

### Setup Automatizado con Diagnóstico:
```bash
# Setup inteligente con auto-reparación
npm run super-setup

# Setup forzado para problemas severos
npm run super-setup:force

# Setup rápido sin iniciar servidor
npm run init:fast

# Setup completo con servidor automático
npm run init:complete
```

### Windows (Método Tradicional):
```bash
# Ejecutar el script de setup automático
./setup.bat

# Después ejecutar:
npm run start:fast
```

### Cualquier Sistema:
```bash
# Comando único para todo
npm run start:local
```

## 🎯 Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `npm run start:fast` | Inicia el servidor inmediatamente |
| `npm run dev:win` | Desarrollo en Windows |
| `npm run setup` | Instala todas las dependencias |
| `npm run clean` | Limpia caches problemáticos |
| `npm run reset` | Reset completo del proyecto |

## 🔧 Solución de Problemas Comunes

### ❌ Error de permisos en Windows
```bash
npm run clean
npm run start:fast
```

### ❌ Dependencias faltantes
```bash
npm run setup
```

### ❌ Variables de entorno
- El archivo `.env.local` se crea automáticamente
- Para base de datos real, editar `DATABASE_URL` en `.env.local`

### ❌ Puerto ocupado
- Cambiar `PORT=5001` en `.env.local`
- O usar: `npx cross-env PORT=5001 tsx server/index.ts`

## 🌐 URLs de Acceso

- **Aplicación**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📝 Desarrollo

### Testing Rápido
```bash
npm run test:quick       # Tests básicos
npm run test:coverage    # Con cobertura
npm run check:quick      # Linting rápido
```

### Base de Datos
```bash
# Solo si tienes DATABASE_URL real
npm run db:setup
```

## 🆘 En Caso de Problemas Severos

```bash
# Reset completo
npm run reset

# O manualmente:
rmdir /s /q node_modules
rmdir /s /q .vite
npm install --force
npm run start:fast
```

---

**✅ Después del setup, el servidor debería estar corriendo en http://localhost:5000**