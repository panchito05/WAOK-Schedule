# 🚀 WAOK-Schedule

**Sistema de gestión de horarios y turnos desarrollado con tecnologías modernas de Full-Stack.**

## 📋 Descripción General

WAOK-Schedule es una aplicación web completa para la gestión de horarios, turnos y programación de actividades. Desarrollada originalmente en Replit y completamente adaptada para ejecución local en Windows con todas las pruebas funcionando correctamente.

## ✅ Estado del Proyecto (Última Actualización: Junio 2024)

- **🟢 Pruebas Unitarias**: Pasando
- **🟢 Pruebas de Integración**: Funcionales
- **🟢 Pruebas E2E**: Configuradas con Playwright
- **🟢 ESLint**: Configuración moderna funcional
- **🟢 TypeScript**: Sin errores de tipado
- **🟢 Build System**: Vite funcionando correctamente
- **🟢 Base de Datos**: Drizzle ORM con Neon Database configurado (o PostgreSQL local)

## 🛠️ Stack Tecnológico

### Backend
- **Express.js** - Framework web para Node.js
- **TypeScript** - Tipado estático para JavaScript
- **Drizzle ORM** - ORM moderno para bases de datos
- **Neon Database / PostgreSQL** - Base de datos SQL
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
- **Playwright** - Framework E2E para pruebas end-to-end
- **ESLint** - Linter para código JavaScript/TypeScript
- **Coverage Reports** - Reportes de cobertura de código

## 🚀 Comandos de Ejecución

### 🎯 Inicialización Definitiva (Recomendado para Windows)

**UN SOLO COMANDO PARA SOLUCIONAR TODO:**
```bash
init.bat
```
Opciones:
- `init.bat --force`        # Reinstalación completa
- `init.bat --no-server`    # Solo setup, sin iniciar servidor

### Alternativa Multiplataforma:
```bash
# Setup inteligente con auto-reparación
npm run super-setup

# Setup forzado para problemas severos
npm run super-setup:force
```

### Desarrollo:
```bash
npm run dev:win             # Servidor desarrollo (Windows Recomendado)
npm run dev                 # Servidor desarrollo (Otros sistemas)
npm run start:fast          # Inicio inmediato del servidor
npm run dev:clean           # Desarrollo con limpieza previa de caché
```
**✨ Acceso a la aplicación:** http://localhost:5000

### Build y Producción:
```bash
npm run build               # Construir para producción
npm start                 # Iniciar en modo producción
```

### Testing y Calidad:

#### Pruebas Unitarias y de Integración (Vitest)
```bash
npm run test:run            # Ejecutar todas las pruebas (recomendado)
npm run test:ui             # Pruebas con interfaz gráfica de Vitest
npm run test:coverage       # Ejecutar pruebas con cobertura completa
npm run test:watch          # Pruebas en modo watch para desarrollo
npm run test:integration    # Pruebas específicas de integración
npm run test:quick          # Pruebas rápidas sin detalles
npm run test:ci             # Pruebas para CI/CD
```

#### Pruebas End-to-End (Playwright)
```bash
npm run test:e2e            # Ejecutar pruebas End-to-End
npm run test:e2e:ui         # Interfaz gráfica de Playwright
npm run test:e2e:debug      # Modo debug para E2E
npm run test:e2e:report     # Ver reportes de E2E
```

#### Linting y Verificación de Tipos:
```bash
npm run lint                # Ejecutar linter (ESLint)
npm run lint:fix            # Corregir errores de linting automáticamente
npm run check               # Verificar tipos de TypeScript (tsc --noEmit)
```

### Diagnóstico y Mantenimiento:
```bash
npm run diagnose            # Diagnóstico completo del sistema y auto-reparación
npm run health-check        # Verificación de salud del sistema
npm run clean               # Limpiar cachés y archivos temporales
npm run reset               # Reset completo del proyecto (elimina node_modules, etc.)
```

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto (o `.env.local` que es generado por `init.bat`):

```env
# Base de datos (Neon o PostgreSQL local)
# Ejemplo Neon: DATABASE_URL=postgresql://user:password@project.region.neon.tech/dbname?sslmode=require
# Ejemplo Local: DATABASE_URL=postgresql://postgres:password@localhost:5432/waok_dev
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/waok_dev

# Tokens de GitHub (opcional, para funcionalidades específicas si se implementan)
GITHUB_TOKEN=
GITHUB_TOKEN_WAOK=

# Configuración del entorno
NODE_ENV=development
PORT=5000

# Secreto de sesión para Express
SESSION_SECRET=un-secreto-muy-largo-y-seguro-aqui

# Configuración de Replit (para compatibilidad si se usa en Replit)
REPL_ID=local-development
```
El script `init.bat` o `npm run super-setup` crea un `.env.local` con valores por defecto si no existe.

## 📁 Estructura del Proyecto

```
WAOK-Schedule/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── hooks/          # Custom hooks de React
│   │   ├── context/        # Contextos de React
│   │   ├── lib/            # Utilidades y configuraciones (ej. axios)
│   │   └── types/          # Definiciones de tipos TypeScript
│   └── index.html          # Punto de entrada HTML para Vite
├── server/                 # Backend Express + TypeScript
│   ├── index.ts            # Servidor principal (punto de entrada)
│   ├── db.ts               # Configuración de base de datos (Drizzle ORM)
│   ├── routes.ts           # Definición de rutas API
│   └── middleware/         # Middlewares de Express
├── shared/                 # Código compartido entre frontend y backend
│   └── schema.ts           # Esquemas de validación (Zod), tipos compartidos
├── scripts/                # Scripts de utilidad (setup, diagnóstico, etc.)
├── docs/                   # Documentación del proyecto (ADRs, etc.)
├── tests/                  # Pruebas E2E de Playwright y otras configuraciones de test
├── coverage/               # Reportes de cobertura de código (generados por Vitest)
├── .github/                # Workflows de GitHub Actions (CI/CD)
├── .env.example            # Ejemplo de variables de entorno
├── package.json            # Dependencias y scripts NPM
├── tsconfig.json           # Configuración principal de TypeScript
├── vite.config.ts          # Configuración de Vite
└── Dockerfile              # Para construir la imagen Docker
```

## 🔧 Solución de Problemas y Problemas Conocidos

### Problemas Críticos Identificados y Soluciones Aplicadas:

1.  **CONFIGURACIÓN DE BASE DE DATOS PROBLEMÁTICA:**
    *   **Problema:** Múltiples configuraciones conflictivas de `DATABASE_URL` en `.env.local`, `docker-compose.yml`, `super-setup.js`, `setup.sh`.
    *   **Solución:** Se ha unificado la gestión de `DATABASE_URL`. `init.bat` y `super-setup.js` ahora generan un `.env.local` consistente. Se recomienda usar `DATABASE_URL` del `.env` o `.env.local` como fuente única de verdad.

2.  **PROBLEMA CON NEON DATABASE CONFIG (WebSocket en `server/db.ts`):
    *   **Problema:** `server/db.ts` importaba `neonConfig` y configuraba `webSocketConstructor`, lo cual es específico para Neon Serverless Driver, pero luego usaba un `Pool` genérico que no lo necesita, causando errores si `ws` no estaba disponible o mal configurado para un Pool estándar.
    *   **Solución:** Se ha simplificado `server/db.ts` para usar `postgres` (de `postgres` library) con `drizzle-orm/postgres-js` que es compatible tanto con Neon como con PostgreSQL estándar sin configuraciones de WebSocket complejas en el código de Drizzle. La URL de conexión (`DATABASE_URL`) determina si se usa SSL o WebSockets (para Neon).

3.  **DEPENDENCIAS CRÍTICAS CON VERSIONES CONFLICTIVAS (Drizzle ORM):
    *   **Problema:** Posibles desajustes entre `drizzle-orm`, `drizzle-zod`, y `drizzle-kit`.
    *   **Solución:** Se han actualizado las dependencias a versiones compatibles y probadas. Revisar `package.json` para las versiones actuales.

4.  **CONFIGURACIÓN DE TYPESCRIPT FRAGMENTADA:**
    *   **Problema:** Referencias en `tsconfig.json` (`tsconfig.app.json`, `tsconfig.node.json`) no incluían correctamente todos los directorios necesarios como `shared` o `server` en el contexto adecuado.
    *   **Solución:** Se ha revisado y corregido `tsconfig.json` y los archivos referenciados (`tsconfig.app.json`, `tsconfig.node.json`) para asegurar que `client/src`, `server/**/*`, y `shared/**/*` estén correctamente incluidos y los alias (`@/*`) funcionen.

5.  **VARIABLES DE ENTORNO DUPLICADAS Y CONFLICTIVAS:**
    *   **Problema:** Múltiples archivos `.env` (`.env`, `.env.local`) con valores diferentes.
    *   **Solución:** `init.bat` y `super-setup.js` priorizan `.env.local`. Se recomienda mantener una única fuente de verdad para las variables de entorno por entorno.

6.  **ESTRUCTURA DE DIRECTORIOS INCONSISTENTE (Alias en `vite.config.ts` vs `tsconfig.app.json`):
    *   **Problema:** `vite.config.ts` definía `@` para `client/src`, pero `tsconfig.app.json` podía tener `include` solo para `src`.
    *   **Solución:** Se ha alineado la configuración de paths y alias en `vite.config.ts` y `tsconfig.*.json` para que sean consistentes.

7.  **TESTS CON CONFIGURACIÓN PROBLEMÁTICA (`vitest.config.ts` thresholds):
    *   **Problema:** Thresholds de cobertura globales muy altos (90%) en `vitest.config.ts` para un proyecto en desarrollo, causando fallos en CI/CD.
    *   **Solución:** Los thresholds se han ajustado a niveles más realistas o se pueden configurar por separado para CI y desarrollo local.

8.  **PROBLEMAS DE CACHÉ Y COMPILACIÓN EN WINDOWS:**
    *   **Problema:** Corrupción de caché de Vite (`.vite/`), problemas de permisos en `node_modules/.cache/`, builds anteriores en `dist/` interfiriendo.
    *   **Solución:** Los scripts `init.bat`, `npm run clean`, y `npm run dev:clean` ayudan a limpiar estos cachés.

### Solución de Problemas Comunes Adicionales:

*   **Error "require is not defined in ES module scope"**: El proyecto usa ES Modules (`"type": "module"` en `package.json`). Si algún script antiguo usa `require()`, debe ser convertido a `import`. Los scripts principales (`super-setup.js`, etc.) ya han sido convertidos.
*   **Servidor no inicia / Puerto ocupado**: 
    1.  Usar `npm run clean`.
    2.  Verificar si el puerto 5000 está en uso: `netstat -ano | findstr :5000` (Windows) y terminar el proceso con `taskkill /F /PID <PID>`.
    3.  Reinstalar dependencias: `npm run reset` seguido de `init.bat`.
*   **Errores de base de datos**: Asegurar que `DATABASE_URL` en `.env` (o `.env.local`) es correcta y que el servidor de base de datos está accesible. Ejecutar `npm run db:push` (si se usa Drizzle Kit para migraciones) o `npm run db:setup` (si hay un script de setup de BD).

## 🧪 Guía de Testing

El proyecto utiliza una estrategia de testing robusta:

-   **Pruebas Unitarias**: Con Vitest, ubicadas generalmente junto a los archivos que prueban (ej. `*.test.ts` o `*.spec.ts`).
-   **Pruebas de Integración**: Con Vitest, probando la interacción entre módulos (ej. API endpoints).
-   **Pruebas End-to-End (E2E)**: Con Playwright, simulando flujos de usuario completos. Configuración en `playwright.config.ts` y pruebas en el directorio `tests/e2e/`.
-   **Pruebas de Regresión**: Aseguran que nuevas funcionalidades no rompan las existentes. Cubiertas por la suite completa de tests.

Consultar la sección "Testing y Calidad" en "Comandos de Ejecución" para ver cómo correr las pruebas.

## 🤝 Contribución

1.  **Fork** el repositorio.
2.  **Crear** una rama para tu feature: `git checkout -b feature/nombre-feature`.
3.  **Implementar** tus cambios. Asegúrate de añadir pruebas unitarias y/o de integración.
4.  **Verificar** que todas las pruebas pasen: `npm run test:run` y `npm run test:e2e`.
5.  **Verificar** el linting y los tipos: `npm run lint` y `npm run check`.
6.  **Commit** tus cambios siguiendo Conventional Commits: `git commit -m 'feat: agregar nueva funcionalidad increíble'`.
7.  **Push** a tu rama: `git push origin feature/nombre-feature`.
8.  **Crear** un Pull Request hacia la rama `main` (o `develop` si existe).

### Estándares de Código:
-   **ESLint**: Seguir las reglas definidas en `eslint.config.js`.
-   **TypeScript**: Tipado fuerte y explícito.
-   **Tests**: Mantener o aumentar la cobertura de código.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` (si existe) para más detalles.

--- 
**🚀 ¡WAOK-Schedule está listo para funcionar!**
Ejecuta `init.bat` (Windows) o `npm run super-setup` y luego `npm run dev` (o `npm run dev:win`).
Visita http://localhost:5000 para comenzar.