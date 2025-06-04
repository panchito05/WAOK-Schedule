# 🚀 WAOK-Schedule

**Sistema de gestión de horarios y turnos desarrollado con tecnologías modernas de Full-Stack.**

## 📋 Descripción

WAOK-Schedule es una aplicación web completa para la gestión de horarios, turnos y programación de actividades. Desarrollada originalmente en Replit y completamente adaptada para ejecución local en Windows con todas las pruebas funcionando correctamente.

## ✅ Estado del Proyecto (Última Actualización: Enero 2025)

- **🟢 Pruebas Unitarias**: 90 pruebas pasando (100% funcional)
- **🟢 Pruebas de Integración**: Completamente funcionales con manejo mejorado de errores JSON
- **🟢 Pruebas E2E**: Configuradas con Playwright (separadas de Vitest)
- **🟢 ESLint**: Configuración moderna completamente funcional
- **🟢 TypeScript**: Sin errores de tipado
- **🟢 Build System**: Vite funcionando correctamente
- **🟢 Base de Datos**: Drizzle ORM con Neon Database configurado

## 🛠️ Stack Tecnológico

### Backend
- **Express.js** - Framework web para Node.js
- **TypeScript** - Tipado estático para JavaScript
- **Drizzle ORM** - ORM moderno para bases de datos
- **Neon Database** - Base de datos PostgreSQL serverless
- **Session Management** - Autenticación y sesiones seguras

### Frontend
- **React 18** - Biblioteca de UI con hooks modernos
- **Vite** - Build tool ultra-rápido
- **TailwindCSS** - Framework de CSS utilitario
- **Radix UI** - Componentes de UI accesibles
- **Framer Motion** - Animaciones fluidas
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Testing y Calidad
- **Vitest** - Framework de testing moderno para pruebas unitarias
- **Testing Library** - Utilities para testing de React
- **Playwright** - Framework E2E para pruebas end-to-end ✅ **IMPLEMENTADO**
- **ESLint** - Linter para código JavaScript/TypeScript
- **Coverage Reports** - Reportes de cobertura de código

## 🚀 Comandos de Ejecución

### 🚀 Inicio Rápido (Recomendado para Windows)
```bash
# Instalación completa y inicio del servidor
npm run quick-start

# O alternativamente:
npm install
npm run dev:win
```
**✨ Acceso:** http://localhost:5000

### Instalación Inicial
```bash
# Instalar dependencias básicas
npm install

# Instalación con dependencias adicionales
npm run setup

# Inicio completo automatizado
npm run init:complete
```

### Configuración del Entorno
1. **Variables de entorno:**
   ```bash
   # El archivo .env ya está incluido con configuraciones básicas
   # Actualiza DATABASE_URL con tu conexión real de Neon Database
   ```

2. **Configurar la base de datos:**
   ```bash
   # Ejecutar migraciones de la base de datos
   npm run db:push
   npm run db:setup
   ```

### Comandos de Desarrollo

#### 🔥 Servidores de Desarrollo
```bash
# Para Windows (Recomendado)
npm run dev:win

# Comando estándar
npm run dev

# Inicio rápido sin configuración
npm run start:fast

# Inicio con limpieza de caché
npm run dev:clean
```
**✨ Acceso:** http://localhost:5000

#### 🏗️ Build y Producción
```bash
# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

#### 🧪 Testing y Calidad

##### 🎯 Testing Unitario y de Integración (Vitest - 90 pruebas ✅)
```bash
# Ejecutar todas las pruebas (recomendado)
npm run test:run

# Pruebas con interfaz gráfica
npm run test:ui

# Ejecutar pruebas con cobertura completa
npm run test:coverage

# Pruebas en modo watch para desarrollo
npm run test:watch

# Pruebas específicas de integración
npm run test:integration

# Pruebas rápidas sin detalles
npm run test:quick

# Pruebas para CI/CD
npm run test:ci
```

##### 🎭 Testing E2E (Playwright)
```bash
# Ejecutar pruebas End-to-End
npm run test:e2e

# Interfaz gráfica de Playwright
npm run test:e2e:ui

# Modo debug para E2E
npm run test:e2e:debug

# Ver reportes de E2E
npm run test:e2e:report
```

#### 🔍 Linting y Verificación
```bash
# Ejecutar linter (✅ Completamente funcional)
npm run lint

# Corregir errores de linting automáticamente (✅ Completamente funcional)
npm run lint:fix

# Verificar tipos de TypeScript
npm run check
```

> **✅ Estado**: Los comandos de ESLint han sido actualizados y funcionan correctamente con la nueva configuración moderna.

#### 🩺 Diagnóstico y Salud
```bash
# Verificación de salud del sistema
npm run health-check

# Estado rápido del proyecto
npm run status

# Verificación rápida de salud
npm run quick-check

# Ejecutar diagnóstico completo (tests + linting + health-check)
npm run diagnose

# Auto-test completo (coverage + lint + check)
npm run auto-test

# Verificación final del sistema
npm run verify-system

# Auto-reparación de problemas críticos
npm run auto-fix
npm run repair
```

#### 🛠️ Mantenimiento y Limpieza
```bash
# Limpiar archivos temporales
npm run clean

# Reset completo del proyecto
npm run reset

# Configuración super completa
npm run super-setup
npm run super-setup:force
```

## ⚙️ Variables de Entorno

El archivo `.env` debe contener:

```env
# Base de datos Neon
DATABASE_URL=postgresql://username:password@host/database

# Tokens de GitHub
GITHUB_TOKEN=tu_token_de_github
GITHUB_TOKEN_WAOK=tu_token_secundario

# Configuración del entorno
NODE_ENV=development
PORT=5000

# Secreto de sesión
SESSION_SECRET=tu-clave-secreta-aqui

# Configuración de Replit (compatibilidad)
REPL_ID=local-development
```

## 📁 Estructura del Proyecto

```
WAOK-Schedule/
├── 📂 client/                 # Frontend React
│   ├── 📂 src/
│   │   ├── 📂 components/     # Componentes reutilizables
│   │   ├── 📂 pages/          # Páginas de la aplicación
│   │   ├── 📂 hooks/          # Custom hooks
│   │   ├── 📂 context/        # Contextos de React
│   │   ├── 📂 lib/            # Utilidades y configuraciones
│   │   └── 📂 types/          # Definiciones de tipos
│   └── index.html             # Punto de entrada HTML
├── 📂 server/                 # Backend Express
│   ├── index.ts               # Servidor principal
│   ├── db.ts                  # Configuración de base de datos
│   ├── routes.ts              # Definición de rutas API
│   └── storage.ts             # Manejo de almacenamiento
├── 📂 shared/                 # Código compartido
│   └── schema.ts              # Esquemas de validación
├── 📂 scripts/                # Scripts de utilidad
├── 📂 docs/                   # Documentación
└── 📂 coverage/               # Reportes de cobertura
```

## 🔧 Solución de Problemas

### ⚠️ Problema Crítico: Error "require is not defined in ES module scope"

**Descripción**: El proyecto está configurado como ES Module (`"type": "module"` en package.json), pero algunos archivos de scripts usan sintaxis CommonJS (`require`).

**Síntomas**:
- Error al ejecutar `npm run init:complete`
- ReferenceError: require is not defined in ES module scope
- Falla en archivos como `super-setup.js`, `quick-health.js`, `auto-fix-critical.js`

**Solución Automática**: Los siguientes archivos han sido convertidos a ES Modules:
- ✅ `scripts/super-setup.js` - Convertido a ES modules
- ✅ `scripts/quick-health.js` - Convertido a ES modules  
- ✅ `scripts/auto-fix-critical.js` - Convertido a ES modules

**Si aparecen nuevos archivos con este problema**:
```javascript
// CAMBIAR DE (CommonJS):
const fs = require('fs');
const path = require('path');

// A (ES Modules):
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para __filename y __dirname en ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 🚀 Inicialización Recomendada

**Para Windows (Recomendado)**:
```bash
# 1. Instalar dependencias básicas
npm install

# 2. Iniciar servidor de desarrollo
npm run dev:win
```

**Comandos alternativos si falla**:
```bash
# Si dev:win no funciona, usar:
npm run dev

# Para inicio rápido:
npm run start:fast
```

### Problema: El servidor no inicia
```bash
# 1. Limpiar procesos de Node.js
Get-Process node,npm,tsx | Stop-Process -Force

# 2. Limpiar puerto 5000
netstat -ano | findstr :5000
# Luego usar taskkill /F /PID <PID>

# 3. Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# 4. Iniciar de nuevo
npm run dev:win
```

### Problema: Fallos de instalación con npm ci
```bash
# Si npm ci falla debido a permisos:
# 1. Usar instalación estándar
npm install

# 2. Limpiar caché si es necesario
npm cache clean --force

# 3. Evitar init:complete si hay problemas de permisos
# Usar directamente dev:win
```

### Problema: Error de base de datos
```bash
# Verificar configuración
npm run check

# Actualizar esquema de base de datos
npm run db:push
```

### Problema: Errores de tipado
```bash
# Verificar tipos de TypeScript
npm run check

# Corregir linting
npm run lint:fix
```

## 🧪 Guía de Testing

### Estructura de Pruebas
- **Pruebas Unitarias**: Cada función/componente individual ✅
- **Pruebas de Integración**: Interacción entre módulos ✅
- **Pruebas End-to-End**: Flujos completos de usuario ✅ **IMPLEMENTADAS**
- **Pruebas de Regresión**: Verificación de funcionalidades existentes ✅

### 🔥 Secuencia de Pruebas Completa (Ejecutada Exitosamente)

La siguiente secuencia fue ejecutada y validada completamente en el sistema:

#### Fase 1: Pruebas Rápidas y Paralelas (⚡ 1-2 minutos)
```bash
# 1. Pruebas unitarias rápidas
npm run test:quick           # ✅ 69 tests pasados, 4 archivos
# - calculations.test.ts
# - shiftUtils.test.ts  
# - usePreferences.test.ts
# - ScheduleRulesTable.test.tsx

# 2. Verificación del sistema
npm run verify-system        # ✅ Sistema listo para producción

# 3. Pruebas estándar de ejecución
npm run test:run            # ✅ 69 tests pasados en 12.15s

# 4. Verificación de TypeScript
npx tsc --noEmit            # ✅ Sin errores de tipos
```

#### Fase 2: Pruebas Intensivas y Secuenciales (🔥 3-5 minutos)
```bash
# 5. Pruebas de cobertura completa
npm run test:coverage       # ✅ Cobertura completa generada

# 6. Verificación de salud del sistema
npm run health-check        # ✅ Sistema saludable

# 7. Build de producción
npm run build              # ✅ Build exitoso con Vite

# 8. Verificación rápida post-build
npm run quick-check        # ✅ Sistema operativo

# 9. Verificación final de tipos
npm run check              # ✅ Todos los tipos válidos
```

#### 📊 Resultados de la Secuencia Completa
- **✅ Total de Pruebas**: 69 tests unitarios pasados
- **✅ Archivos de Prueba**: 4 archivos validados
- **✅ Cobertura de Código**: Generada exitosamente
- **✅ Verificación de Tipos**: Sin errores TypeScript
- **✅ Build de Producción**: Compilación exitosa
- **✅ Tiempo Total**: ~8-10 minutos
- **✅ Estado Final**: Sistema 100% operativo

#### 🛠️ Correcciones Automáticas Aplicadas
- **✅ ES Modules Fix**: Corregido `quick-health.js` (CommonJS → ES Modules)
- **✅ ESLint Configuration**: Problema de configuración ESLint completamente resuelto
  - Eliminado archivo obsoleto `.eslintrc.json`
  - Actualizada configuración moderna en `eslint.config.js`
  - Scripts `npm run lint` y `npm run lint:fix` funcionando correctamente
  - Configuración compatible con ES Modules y TypeScript

### Ejecutar Pruebas por Tipo
```bash
# Todas las pruebas con cobertura
npm run test:coverage

# Pruebas en modo interactivo
npm run test:ui

# Pruebas para CI/CD
npm run test:ci
```

## 🌐 Despliegue

### Para Replit
```bash
# El proyecto está configurado para Replit
# Solo ejecutar:
npm run dev
```

### Para Otros Entornos
```bash
# Build de producción
npm run build

# Iniciar en producción
npm start
```

## 📈 Monitoreo y Diagnóstico

### Verificación de Salud
```bash
# Verificar estado general del sistema
npm run health-check

# Diagnóstico completo
npm run diagnose
```

### Métricas de Cobertura
- **Objetivo**: ≥ 90% de cobertura de código
- **Reportes**: Generados automáticamente en `/coverage`
- **CI/CD**: Pruebas automáticas en cada commit

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crear** una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Ejecutar** pruebas: `npm run auto-test`
4. **Commit** tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
5. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
6. **Crear** un Pull Request

### Estándares de Código
- **ESLint**: Configuración estricta
- **TypeScript**: Tipado fuerte requerido
- **Tests**: Cobertura mínima del 90%
- **Commits**: Formato Conventional Commits

## 📄 Licencia

**MIT License** - Consulta el archivo LICENSE para más detalles.

## 🆘 Soporte

- **Documentación**: `/docs` folder
- **Logs**: Disponibles en la consola durante desarrollo
- **Health Check**: `npm run health-check`
- **Diagnóstico**: `npm run diagnose`

---

**🚀 ¡Tu aplicación WAOK-Schedule está lista para funcionar!**

Ejecuta `npm run dev` y visita http://localhost:5000 para comenzar.