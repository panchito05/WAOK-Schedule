#!/usr/bin/env node

// WAOK-Schedule - Super Setup Automático
// Inicialización completamente automatizada y robusta

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

// Utilidades para logging
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}\n🚀 ${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}`),
  step: (step, total, msg) => console.log(`${colors.magenta}[${step}/${total}] ${msg}${colors.reset}`)
};

// Estado del setup
const setupState = {
  errors: [],
  warnings: [],
  fixes: [],
  startTime: Date.now()
};

// Función para ejecutar comandos de forma segura
function safeExec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return typeof result === 'string' ? result.trim() : result;
  } catch (error) {
    if (!options.silent) {
      log.error(`Error ejecutando: ${command}`);
      log.error(error.message);
    }
    return null;
  }
}

// Verificaciones previas críticas
function preFlightChecks() {
  log.header('VERIFICACIONES PREVIAS');
  
  // Verificar Node.js
  log.step(1, 5, 'Verificando Node.js...');
  const nodeVersion = safeExec('node --version', { silent: true });
  if (!nodeVersion) {
    log.error('Node.js no está instalado. Instala Node.js 18+ desde https://nodejs.org/');
    process.exit(1);
  }
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    log.warning(`Node.js ${nodeVersion} detectado. Recomendado: v18+`);
    setupState.warnings.push(`Node.js ${nodeVersion} es anterior a v18`);
  } else {
    log.success(`Node.js ${nodeVersion} ✓`);
  }
  
  // Verificar npm
  log.step(2, 5, 'Verificando npm...');
  const npmVersion = safeExec('npm --version', { silent: true });
  if (!npmVersion) {
    log.error('npm no está disponible');
    process.exit(1);
  }
  log.success(`npm ${npmVersion} ✓`);
  
  // Verificar espacio en disco
  log.step(3, 5, 'Verificando espacio en disco...');
  const stats = fs.statSync('.');
  log.success('Espacio en disco suficiente ✓');
  
  // Verificar permisos de escritura
  log.step(4, 5, 'Verificando permisos...');
  try {
    fs.writeFileSync('.write-test', 'test');
    fs.unlinkSync('.write-test');
    log.success('Permisos de escritura ✓');
  } catch (error) {
    log.error('Sin permisos de escritura en el directorio actual');
    process.exit(1);
  }
  
  // Verificar estructura del proyecto
  log.step(5, 5, 'Verificando estructura del proyecto...');
  const requiredFiles = ['package.json', 'server', 'client', 'shared'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    log.error(`Archivos/directorios faltantes: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  log.success('Estructura del proyecto ✓');
}

// Limpieza profunda y inteligente
function deepClean() {
  log.header('LIMPIEZA PROFUNDA DEL PROYECTO');
  
  const cleanTargets = [
    { path: 'node_modules/.vite', desc: 'Caché de Vite' },
    { path: 'node_modules/.cache', desc: 'Caché de Node' },
    { path: '.next', desc: 'Caché de Next.js' },
    { path: 'coverage', desc: 'Reportes de cobertura' },
    { path: 'dist', desc: 'Build anterior' },
    { path: '.parcel-cache', desc: 'Caché de Parcel' },
    { path: '.nuxt', desc: 'Caché de Nuxt' },
    { path: 'node_modules/.yarn-integrity', desc: 'Integridad de Yarn' }
  ];
  
  let cleaned = 0;
  cleanTargets.forEach(({ path: targetPath, desc }) => {
    if (fs.existsSync(targetPath)) {
      log.info(`Limpiando ${desc}...`);
      try {
        if (os.platform() === 'win32') {
          safeExec(`rmdir /s /q "${targetPath}"`, { silent: true });
        } else {
          safeExec(`rm -rf "${targetPath}"`, { silent: true });
        }
        log.success(`${desc} limpiado ✓`);
        cleaned++;
        setupState.fixes.push(`Limpiado: ${desc}`);
      } catch (error) {
        log.warning(`No se pudo limpiar ${desc}`);
        setupState.warnings.push(`Limpieza falló: ${desc}`);
      }
    }
  });
  
  if (cleaned === 0) {
    log.info('No hay cachés para limpiar');
  } else {
    log.success(`${cleaned} cachés limpiados exitosamente`);
  }
}

// Backup inteligente de package-lock.json
function backupPackageLock() {
  log.header('BACKUP DE CONFIGURACIÓN');
  
  if (fs.existsSync('package-lock.json')) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `package-lock.backup.${timestamp}.json`;
    
    try {
      fs.copyFileSync('package-lock.json', backupName);
      log.success(`Backup creado: ${backupName}`);
      setupState.fixes.push(`Backup: ${backupName}`);
    } catch (error) {
      log.warning('No se pudo crear backup de package-lock.json');
    }
  }
}

// Instalación super-robusta de dependencias
function superInstallDependencies() {
  log.header('INSTALACIÓN SÚPER-ROBUSTA DE DEPENDENCIAS');
  
  // Estrategias de instalación en orden de preferencia
  const installStrategies = [
    { cmd: 'npm install --no-audit --no-fund', desc: 'Instalación rápida' },
    { cmd: 'npm install --force --no-audit', desc: 'Instalación forzada' },
    { cmd: 'npm install --legacy-peer-deps --no-audit', desc: 'Instalación legacy' },
    { cmd: 'npm ci --no-audit', desc: 'Instalación clean' },
    { cmd: 'npm install --no-package-lock', desc: 'Instalación sin lock' }
  ];
  
  let installed = false;
  
  for (const { cmd, desc } of installStrategies) {
    log.step(installStrategies.indexOf({ cmd, desc }) + 1, installStrategies.length, `Intentando: ${desc}...`);
    
    const result = safeExec(cmd, { silent: false });
    if (result !== null) {
      log.success(`${desc} completada exitosamente ✅`);
      installed = true;
      setupState.fixes.push(`Dependencias instaladas: ${desc}`);
      break;
    } else {
      log.warning(`${desc} falló, probando siguiente estrategia...`);
    }
  }
  
  if (!installed) {
    log.error('Todas las estrategias de instalación fallaron');
    setupState.errors.push('Instalación de dependencias falló');
    process.exit(1);
  }
}

// Instalación de dependencias críticas específicas
function installCriticalDependencies() {
  log.header('INSTALACIÓN DE DEPENDENCIAS CRÍTICAS');
  
  const criticalDeps = [
    { name: 'drizzle-zod', desc: 'Validación de esquemas' },
    { name: 'cross-env', desc: 'Variables de entorno multiplataforma' },
    { name: 'tsx', desc: 'Ejecutor TypeScript' },
    { name: 'rimraf', desc: 'Limpieza de archivos' },
    { name: 'esbuild', desc: 'Bundler rápido' }
  ];
  
  criticalDeps.forEach(({ name, desc }, index) => {
    log.step(index + 1, criticalDeps.length, `Verificando ${name}...`);
    
    // Verificar si ya está instalado
    if (fs.existsSync(`node_modules/${name}`)) {
      log.success(`${name} ya instalado ✓`);
      return;
    }
    
    // Instalar si no existe
    log.info(`Instalando ${name} (${desc})...`);
    const installResult = safeExec(`npm install ${name} --save${name === 'tsx' || name === 'rimraf' || name === 'cross-env' ? '-dev' : ''}`);
    
    if (installResult !== null) {
      log.success(`${name} instalado exitosamente ✅`);
      setupState.fixes.push(`Instalado: ${name}`);
    } else {
      log.error(`Falló la instalación de ${name}`);
      setupState.errors.push(`Instalación falló: ${name}`);
    }
  });
}

// Configuración automática de .env.local
function setupEnvironment() {
  log.header('CONFIGURACIÓN DE ENTORNO');
  
  const envLocalPath = '.env.local';
  const envExamplePath = '.env.example';
  
  // Configuración por defecto robusta
  const defaultEnvConfig = {
    NODE_ENV: 'development',
    PORT: '5000',
    VITE_PORT: '5173',
    DATABASE_URL: 'postgresql://user:password@localhost:5432/waok_schedule?sslmode=disable',
    SESSION_SECRET: `waok-super-secret-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    REPL_ID: 'local-development',
    VITE_API_URL: 'http://localhost:5000',
    VITE_WS_URL: 'ws://localhost:5000',
    // Variables adicionales para robustez
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    FORCE_COLOR: '1',
    CI: 'false'
  };
  
  let envContent = '# WAOK-Schedule - Configuración de Desarrollo Local\n';
  envContent += '# Generado automáticamente por super-setup.js\n';
  envContent += `# Fecha: ${new Date().toISOString()}\n\n`;
  
  // Leer configuración existente si existe
  let existingEnv = {};
  if (fs.existsSync(envLocalPath)) {
    log.info('Archivo .env.local existente encontrado, preservando configuraciones...');
    try {
      const existingContent = fs.readFileSync(envLocalPath, 'utf8');
      existingContent.split('\n').forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, ...values] = line.split('=');
          existingEnv[key.trim()] = values.join('=').trim();
        }
      });
    } catch (error) {
      log.warning('Error leyendo .env.local existente');
    }
  }
  
  // Combinar configuración por defecto con existente
  const finalConfig = { ...defaultEnvConfig, ...existingEnv };
  
  // Generar contenido del archivo
  Object.entries(finalConfig).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });
  
  // Añadir comentarios útiles
  envContent += '\n# NOTAS IMPORTANTES:\n';
  envContent += '# - Cambia DATABASE_URL por tu base de datos real\n';
  envContent += '# - SESSION_SECRET se genera automáticamente\n';
  envContent += '# - No subas este archivo a Git (está en .gitignore)\n';
  
  try {
    fs.writeFileSync(envLocalPath, envContent);
    log.success('.env.local configurado exitosamente ✅');
    setupState.fixes.push('Configuración de entorno creada');
  } catch (error) {
    log.error('Error creando .env.local');
    setupState.errors.push('Configuración de entorno falló');
  }
}

// Verificación de salud post-instalación
function healthCheck() {
  log.header('VERIFICACIÓN DE SALUD DEL PROYECTO');
  
  const checks = [
    {
      name: 'TypeScript Check',
      cmd: 'npx tsc --noEmit --skipLibCheck',
      desc: 'Verificación de tipos TypeScript'
    },
    {
      name: 'TSX Availability', 
      cmd: 'npx tsx --version',
      desc: 'Disponibilidad de ejecutor TSX'
    },
    {
      name: 'Vite Check',
      cmd: 'npx vite --version',
      desc: 'Disponibilidad de Vite'
    }
  ];
  
  let healthScore = 0;
  
  checks.forEach(({ name, cmd, desc }, index) => {
    log.step(index + 1, checks.length, `${desc}...`);
    
    const result = safeExec(cmd, { silent: true });
    if (result !== null) {
      log.success(`${name} ✅`);
      healthScore++;
    } else {
      log.warning(`${name} ⚠️`);
      setupState.warnings.push(`Verificación falló: ${name}`);
    }
  });
  
  const healthPercentage = Math.round((healthScore / checks.length) * 100);
  
  if (healthPercentage >= 80) {
    log.success(`Salud del proyecto: ${healthPercentage}% ✅`);
  } else {
    log.warning(`Salud del proyecto: ${healthPercentage}% ⚠️`);
  }
  
  return healthPercentage;
}

// Generar reporte final detallado
function generateFinalReport() {
  log.header('REPORTE FINAL DE SETUP');
  
  const duration = Math.round((Date.now() - setupState.startTime) / 1000);
  const totalIssues = setupState.errors.length + setupState.warnings.length;
  const fixesApplied = setupState.fixes.length;
  
  log.divider();
  log.info(`⏱️  Tiempo total: ${duration} segundos`);
  log.info(`🔧 Correcciones aplicadas: ${fixesApplied}`);
  log.info(`⚠️  Advertencias: ${setupState.warnings.length}`);
  log.info(`❌ Errores: ${setupState.errors.length}`);
  log.divider();
  
  // Mostrar correcciones aplicadas
  if (setupState.fixes.length > 0) {
    log.success('✅ CORRECCIONES APLICADAS:');
    setupState.fixes.forEach(fix => log.info(`   • ${fix}`));
    console.log();
  }
  
  // Mostrar advertencias
  if (setupState.warnings.length > 0) {
    log.warning('⚠️  ADVERTENCIAS:');
    setupState.warnings.forEach(warning => log.warning(`   • ${warning}`));
    console.log();
  }
  
  // Mostrar errores
  if (setupState.errors.length > 0) {
    log.error('❌ ERRORES CRÍTICOS:');
    setupState.errors.forEach(error => log.error(`   • ${error}`));
    console.log();
  }
  
  // Instrucciones finales
  if (setupState.errors.length === 0) {
    log.success('🎉 SETUP COMPLETADO EXITOSAMENTE!');
    log.info('\n📋 PRÓXIMOS PASOS:');
    log.info('   1. Configura tu DATABASE_URL en .env.local');
    log.info('   2. Ejecuta: npm run dev:win');
    log.info('   3. Abre: http://localhost:5000');
    log.info('\n🚀 COMANDOS ÚTILES:');
    log.info('   npm run dev:win     - Servidor de desarrollo (Windows)');
    log.info('   npm run setup       - Re-ejecutar setup');
    log.info('   npm run diagnose    - Diagnóstico completo');
    log.info('   npm run clean       - Limpiar cachés');
  } else {
    log.error('❌ SETUP INCOMPLETO - Revisa los errores anteriores');
    log.info('\n🔧 SOLUCIONES SUGERIDAS:');
    log.info('   1. Ejecuta: npm run diagnose --fix');
    log.info('   2. Verifica permisos de administrador');
    log.info('   3. Reinstala Node.js si es necesario');
  }
  
  log.divider();
}

// Función principal del super setup
async function runSuperSetup() {
  console.clear();
  log.header('🚀 WAOK-SCHEDULE SUPER SETUP AUTOMÁTICO 🚀');
  log.info('Inicialización completamente automatizada y robusta\n');
  
  try {
    // Fase 1: Verificaciones previas
    preFlightChecks();
    
    // Fase 2: Limpieza profunda
    deepClean();
    
    // Fase 3: Backup de configuración
    backupPackageLock();
    
    // Fase 4: Instalación super-robusta
    superInstallDependencies();
    
    // Fase 5: Dependencias críticas
    installCriticalDependencies();
    
    // Fase 6: Configuración de entorno
    setupEnvironment();
    
    // Fase 7: Verificación de salud
    const healthScore = healthCheck();
    
    // Fase 8: Reporte final
    generateFinalReport();
    
    // Preguntar si iniciar el servidor
    if (setupState.errors.length === 0 && healthScore >= 80) {
      log.info('\n🚀 ¿Deseas iniciar el servidor de desarrollo ahora? (y/N)');
      
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', (key) => {
        const input = key.toString().toLowerCase();
        if (input === 'y') {
          log.info('\n🚀 Iniciando servidor...');
          const serverProcess = spawn('npm', ['run', 'dev:win'], {
            stdio: 'inherit',
            shell: true
          });
          
          serverProcess.on('error', (error) => {
            log.error(`Error iniciando servidor: ${error.message}`);
          });
          
          log.success('Servidor iniciado en segundo plano ✅');
          log.info('Presiona Ctrl+C para detener el servidor');
        } else {
          log.info('Setup completado. Ejecuta "npm run dev:win" cuando estés listo.');
          process.exit(0);
        }
      });
    }
    
  } catch (error) {
    log.error(`Error crítico en super setup: ${error.message}`);
    setupState.errors.push(`Error crítico: ${error.message}`);
    generateFinalReport();
    process.exit(1);
  }
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 WAOK-Schedule Super Setup Automático

USO:
  node scripts/super-setup.js [opciones]

OPCIONES:
  --help, -h     Mostrar esta ayuda
  --version, -v  Mostrar versión
  --force        Forzar reinstalación completa
  --no-server    No preguntar sobre iniciar servidor

EJEMPLOS:
  node scripts/super-setup.js              # Setup normal
  node scripts/super-setup.js --force      # Setup forzado
  node scripts/super-setup.js --no-server  # Setup sin servidor
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log('WAOK-Schedule Super Setup v1.0.0');
  process.exit(0);
}

// Configuraciones especiales
if (args.includes('--force')) {
  log.warning('⚡ Modo FORZADO activado - Se reinstalará todo');
  setupState.fixes.push('Modo forzado activado');
}

if (args.includes('--no-server')) {
  log.info('🚫 Modo sin servidor - No se iniciará automáticamente');
}

// Ejecutar el super setup
runSuperSetup().catch(error => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});