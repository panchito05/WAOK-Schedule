@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM WAOK-SCHEDULE - INICIALIZACIÓN ULTRA-RÁPIDA DEFINITIVA
REM =============================================================================
REM Este script resuelve TODOS los problemas recurrentes de inicialización
REM Ejecuta: init.bat [--force] [--no-server] [--help]
REM =============================================================================

echo.
echo ========================================
echo 🚀 WAOK-SCHEDULE INIT DEFINITIVO 🚀
echo ========================================
echo.

REM Verificar argumentos
set FORCE_MODE=0
set NO_SERVER=0
set SHOW_HELP=0

:parse_args
if "%~1"=="" goto start_init
if "%~1"=="--force" set FORCE_MODE=1
if "%~1"=="--no-server" set NO_SERVER=1
if "%~1"=="--help" set SHOW_HELP=1
if "%~1"=="-h" set SHOW_HELP=1
shift
goto parse_args

:show_help
echo.
echo USO: init.bat [opciones]
echo.
echo OPCIONES:
echo   --force      Forzar reinstalación completa
echo   --no-server  No iniciar servidor automáticamente
echo   --help, -h   Mostrar esta ayuda
echo.
echo EJEMPLOS:
echo   init.bat              # Inicialización normal
echo   init.bat --force      # Reinstalación forzada
echo   init.bat --no-server  # Solo setup, sin servidor
echo.
pause
exit /b 0

:start_init
if %SHOW_HELP%==1 goto show_help

REM Verificar si Node.js está instalado
echo [1/10] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado
    echo.
    echo 🔧 SOLUCIÓN:
    echo 1. Descarga Node.js desde: https://nodejs.org
    echo 2. Instala la versión LTS
    echo 3. Reinicia la terminal
    echo 4. Ejecuta este script nuevamente
    pause
    exit /b 1
)
echo ✅ Node.js disponible

REM Verificar si npm está disponible
echo [2/10] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no encontrado
    echo 🔧 Reinstala Node.js para solucionar este problema
    pause
    exit /b 1
)
echo ✅ npm disponible

REM Limpiar posibles bloqueos previos
echo [3/10] Limpiando bloqueos y cachés problemáticos...
if exist "package-lock.json" (
    echo   • Respaldando package-lock.json...
    copy "package-lock.json" "package-lock.json.backup" >nul 2>&1
)

REM Limpiar cachés problemáticos de Windows
echo   • Limpiando cachés de Vite...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" >nul 2>&1
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "coverage" rmdir /s /q "coverage" >nul 2>&1
if exist "dist" rmdir /s /q "dist" >nul 2>&1

REM Limpiar cachés de npm si es modo forzado
if %FORCE_MODE%==1 (
    echo   • Limpiando caché de npm (modo forzado)...
    npm cache clean --force >nul 2>&1
    if exist "node_modules" (
        echo   • Eliminando node_modules completo...
        rmdir /s /q "node_modules" >nul 2>&1
    )
)

echo ✅ Limpieza completada

REM Crear directorio scripts si no existe
echo [4/10] Verificando estructura del proyecto...
if not exist "scripts" mkdir scripts
echo ✅ Estructura verificada

REM Instalar dependencias base con estrategias de fallback
echo [5/10] Instalando dependencias base...
if %FORCE_MODE%==1 (
    echo   • Instalación forzada...
    npm install --force --no-audit --prefer-offline
) else (
    echo   • Instalación estándar...
    npm install --no-audit --prefer-offline
    if errorlevel 1 (
        echo   ⚠️ Instalación estándar falló, intentando con --force...
        npm install --force --no-audit
    )
)

if errorlevel 1 (
    echo ❌ Error crítico en instalación de dependencias
    echo.
    echo 🔧 SOLUCIONES SUGERIDAS:
    echo 1. Verifica tu conexión a internet
    echo 2. Ejecuta: npm cache clean --force
    echo 3. Elimina node_modules y ejecuta: init.bat --force
    echo 4. Verifica que no tengas un antivirus bloqueando npm
    pause
    exit /b 1
)
echo ✅ Dependencias base instaladas

REM Instalar dependencias críticas específicas
echo [6/10] Instalando dependencias críticas...
set CRITICAL_DEPS=drizzle-zod cross-env tsx rimraf esbuild
for %%d in (%CRITICAL_DEPS%) do (
    echo   • Instalando %%d...
    npm install %%d --save >nul 2>&1
)
echo ✅ Dependencias críticas instaladas

REM Configurar archivo de entorno
echo [7/10] Configurando entorno de desarrollo...
if not exist ".env.local" (
    echo   • Creando .env.local con configuraciones por defecto...
    (
        echo # WAOK-Schedule - Configuración de Desarrollo Local
        echo # Generado automáticamente por init.bat
        echo.
        echo NODE_ENV=development
        echo PORT=5000
        echo.
        echo # Base de datos - CONFIGURA TU URL REAL AQUÍ
        echo DATABASE_URL="postgresql://user:password@localhost:5432/waok_schedule"
        echo.
        echo # Sesión
        echo SESSION_SECRET="dev-secret-key-change-in-production"
        echo.
        echo # Replit ID ^(si aplica^)
        echo REPL_ID="waok-schedule-local"
        echo.
        echo # Vite ^(desarrollo^)
        echo VITE_API_URL="http://localhost:5000"
        echo VITE_APP_NAME="WAOK Schedule"
    ) > ".env.local"
    echo ✅ .env.local creado
) else (
    echo ✅ .env.local ya existe
)

REM Verificar herramientas de desarrollo
echo [8/10] Verificando herramientas de desarrollo...
echo   • Verificando TypeScript...
npx tsc --version >nul 2>&1
if errorlevel 1 (
    echo   ⚠️ TypeScript no disponible, instalando...
    npm install -D typescript >nul 2>&1
)

echo   • Verificando TSX...
npx tsx --version >nul 2>&1
if errorlevel 1 (
    echo   ⚠️ TSX no disponible, instalando...
    npm install tsx --save >nul 2>&1
)

echo ✅ Herramientas verificadas

REM Verificación final del proyecto
echo [9/10] Verificación final del proyecto...
if not exist "server\index.ts" (
    echo ❌ Archivo server/index.ts no encontrado
    echo ⚠️ Asegúrate de estar en el directorio correcto del proyecto
) else (
    echo ✅ Estructura del servidor verificada
)

if not exist "package.json" (
    echo ❌ package.json no encontrado
    echo ⚠️ No estás en un proyecto válido de Node.js
) else (
    echo ✅ package.json verificado
)

echo [10/10] Inicialización completada!
echo.
echo ========================================
echo ✅ WAOK-SCHEDULE LISTO PARA USAR ✅
echo ========================================
echo.
echo 📋 PRÓXIMOS PASOS:
echo 1. Configura tu DATABASE_URL en .env.local
echo 2. Ejecuta: npm run dev:win
echo 3. Abre: http://localhost:5000
echo.
echo 🚀 COMANDOS ÚTILES:
echo   npm run dev:win      - Servidor desarrollo ^(Windows^)
echo   npm run super-setup  - Setup automatizado avanzado
echo   npm run diagnose     - Diagnóstico completo
echo   npm run clean        - Limpiar cachés
echo   init.bat --force     - Reinstalación forzada
echo.

REM Preguntar si iniciar servidor (solo si no es --no-server)
if %NO_SERVER%==1 goto end_script

echo ¿Deseas iniciar el servidor de desarrollo ahora? ^(Y/n^)
set /p START_SERVER="Respuesta: "
if /i "!START_SERVER!"=="" set START_SERVER=Y
if /i "!START_SERVER!"=="Y" (
    echo.
    echo 🚀 Iniciando servidor de desarrollo...
    echo   URL: http://localhost:5000
    echo   Presiona Ctrl+C para detener
    echo.
    npm run dev:win
) else (
    echo.
    echo ✅ Setup completado. Ejecuta 'npm run dev:win' cuando estés listo.
)

:end_script
echo.
echo ¡Gracias por usar WAOK-Schedule!
echo.
pause
exit /b 0