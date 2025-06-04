@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo   🚀 WAOK-Schedule - Setup Automatico
echo ==========================================
echo.

REM Verificar Node.js
echo [1/9] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no esta instalado
    echo Por favor instala Node.js v18+ desde: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detectado: !NODE_VERSION!

REM Verificar npm
echo [2/9] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm no esta disponible
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm detectado: !NPM_VERSION!

REM Limpiar caches problematicos
echo.
echo [3/9] Limpiando caches problematicos...
if exist "node_modules\.vite" (
    echo Eliminando cache de Vite...
    rmdir /s /q "node_modules\.vite" 2>nul
)
if exist ".next" (
    echo Eliminando cache de Next...
    rmdir /s /q ".next" 2>nul
)
if exist "coverage" (
    echo Eliminando reportes de cobertura...
    rmdir /s /q "coverage" 2>nul
)
if exist "dist" (
    echo Eliminando build anterior...
    rmdir /s /q "dist" 2>nul
)
echo ✅ Caches limpiados

REM Respaldar package-lock.json
echo.
echo [4/9] Preparando instalacion...
if exist "package-lock.json" (
    copy "package-lock.json" "package-lock.json.backup" >nul 2>&1
    echo ✅ package-lock.json respaldado
) else (
    echo ⚠️  package-lock.json no existe
)
echo ✅ Preparacion completada

REM Instalar dependencias base
echo.
echo [5/9] Instalando dependencias base...
echo Por favor espera, esto puede tomar varios minutos...
npm install --force --silent --no-audit --prefer-offline
if errorlevel 1 (
    echo ⚠️  Instalacion estandar fallo, intentando modo legacy...
    npm install --legacy-peer-deps --silent
    if errorlevel 1 (
        echo ❌ ERROR CRITICO: No se pudieron instalar las dependencias
        pause
        exit /b 1
    ) else (
        echo ✅ Dependencias instaladas en modo legacy
    )
) else (
    echo ✅ Dependencias base instaladas
)

REM Instalar dependencias criticas
echo.
echo [6/9] Instalando dependencias criticas...
set DEPS=drizzle-zod cross-env tsx rimraf esbuild
for %%d in (!DEPS!) do (
    echo Verificando %%d...
    npm list %%d >nul 2>&1
    if errorlevel 1 (
        echo Instalando %%d...
        npm install %%d --save --no-audit --silent
        if errorlevel 1 (
            echo ⚠️  Fallo instalacion de %%d
        ) else (
            echo ✅ %%d instalado
        )
    ) else (
        echo ✅ %%d ya instalado
    )
)
echo ✅ Dependencias criticas verificadas

REM Configurar .env.local
echo.
echo [7/9] Configurando variables de entorno...
if not exist ".env.local" (
    (
        echo # WAOK-Schedule - Configuracion Local de Desarrollo
        echo # Generado automaticamente por setup.bat
        echo.
        echo DATABASE_URL=postgresql://dummy:dummy@localhost:5432/waok_dev
        echo NODE_ENV=development
        echo PORT=5000
        echo SESSION_SECRET=dev-secret-waok-2024-win
        echo REPL_ID=local-dev-windows
        echo VITE_APP_TITLE=WAOK Schedule - Local Dev
        echo VITE_API_BASE_URL=http://localhost:5000
        echo.
        echo # Para base de datos real, reemplazar DATABASE_URL
        echo # DATABASE_URL=postgres://user:pass@host/db?sslmode=require
    ) > .env.local
    echo ✅ Archivo .env.local creado
) else (
    echo ✅ Archivo .env.local ya existe
)

REM Verificar TypeScript y tsx
echo.
echo [8/9] Verificacion de herramientas...
echo Verificando TypeScript...
npx tsc --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  TypeScript no detectado globalmente
) else (
    echo ✅ TypeScript verificado
)

echo Verificando tsx...
npx tsx --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  tsx no funciona, reinstalando...
    npm install tsx --save-dev --silent
) else (
    echo ✅ tsx verificado
)

REM Verificacion final del proyecto
echo.
echo [9/9] Verificacion final del sistema...
npm run check --silent >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Se detectaron algunos problemas de codigo
) else (
    echo ✅ Verificacion de codigo exitosa
)
echo ✅ Verificacion completada

echo.
echo ==========================================
echo   🎉 SETUP COMPLETADO EXITOSAMENTE!
echo ==========================================
echo.
echo 📋 PROXIMOS PASOS:
echo.
echo 1. Para iniciar el servidor inmediatamente:
echo    npm run start:fast
echo.
echo 2. Para desarrollo continuo:
echo    npm run dev:win
echo.
echo 3. Para verificar que todo funciona:
echo    npm run check:quick
echo.
echo 🌐 URLs disponibles despues del inicio:
echo    • Aplicacion: http://localhost:5000
echo    • API: http://localhost:5000/api
echo    • Health Check: http://localhost:5000/health
echo.
echo 🐳 Para usar Docker:
echo    docker-compose up -d
echo.
echo 📝 Para mas informacion, consulta INICIO-RAPIDO.md
echo.
echo ==========================================
echo.
set /p "START=¿Deseas iniciar el servidor ahora? (s/N): "
if /i "!START!"=="s" (
    echo.
    echo Iniciando servidor...
    npm run start:fast
) else (
    echo.
    echo Setup completado. Ejecuta 'npm run start:fast' cuando estes listo.
    pause
)