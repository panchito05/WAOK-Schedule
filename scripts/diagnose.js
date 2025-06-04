#!/usr/bin/env node

// WAOK-Schedule - Sistema de Diagnóstico Automático
// Detecta y reporta problemas comunes del proyecto

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para compatibilidad con ES modules
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
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

// Estado del diagnóstico
const diagnosticResults = {
  errors: [],
  warnings: [],
  successes: [],
  fixes: []
};

// Función para ejecutar comandos de forma segura
function safeExec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options
    }).trim();
  } catch (error) {
    return null;
  }
}

// Verificar Node.js y npm
function checkNodeAndNpm() {
  log.header('🔍 Verificando Node.js y npm...');
  
  const nodeVersion = safeExec('node --version');
  if (nodeVersion) {
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 18) {
      log.success(`Node.js ${nodeVersion} (✓ Compatible)`);
      diagnosticResults.successes.push(`Node.js ${nodeVersion}`);
    } else {
      log.warning(`Node.js ${nodeVersion} (⚠️  Recomendado: v18+)`);
      diagnosticResults.warnings.push(`Node.js ${nodeVersion} es anterior a v18`);
    }
  } else {
    log.error('Node.js no está instalado');
    diagnosticResults.errors.push('Node.js no instalado');
  }
  
  const npmVersion = safeExec('npm --version');
  if (npmVersion) {
    log.success(`npm ${npmVersion}`);
    diagnosticResults.successes.push(`npm ${npmVersion}`);
  } else {
    log.error('npm no está disponible');
    diagnosticResults.errors.push('npm no disponible');
  }
}

// Verificar archivos esenciales del proyecto
function checkEssentialFiles() {
  log.header('📁 Verificando archivos esenciales...');
  
  const essentialFiles = [
    'package.json',
    'server/index.ts',
    'server/db.ts',
    'shared/schema.ts',
    'client/src/main.tsx'
  ];
  
  essentialFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`${file} existe`);
      diagnosticResults.successes.push(`Archivo ${file} encontrado`);
    } else {
      log.error(`${file} no encontrado`);
      diagnosticResults.errors.push(`Archivo ${file} faltante`);
    }
  });
}

// Verificar dependencias
function checkDependencies() {
  log.header('📦 Verificando dependencias...');
  
  if (!fs.existsSync('node_modules')) {
    log.error('node_modules no existe - ejecuta npm install');
    diagnosticResults.errors.push('node_modules faltante');
    diagnosticResults.fixes.push('Ejecutar: npm install');
    return;
  }
  
  const criticalDeps = [
    'express',
    'drizzle-orm',
    'drizzle-zod',
    'tsx',
    'cross-env',
    'vite'
  ];
  
  criticalDeps.forEach(dep => {
    const result = safeExec(`npm list ${dep}`);
    if (result && !result.includes('UNMET')) {
      log.success(`${dep} instalado`);
      diagnosticResults.successes.push(`Dependencia ${dep} OK`);
    } else {
      log.warning(`${dep} no instalado o problema de versión`);
      diagnosticResults.warnings.push(`Dependencia ${dep} problemática`);
      diagnosticResults.fixes.push(`Instalar: npm install ${dep}`);
    }
  });
}

// Verificar variables de entorno
function checkEnvironmentVariables() {
  log.header('🌍 Verificando variables de entorno...');
  
  const envFiles = ['.env', '.env.local'];
  let envFileFound = false;
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`${file} encontrado`);
      diagnosticResults.successes.push(`Archivo ${file} existe`);
      envFileFound = true;
      
      // Verificar contenido básico
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('DATABASE_URL')) {
        log.success('DATABASE_URL definido');
      } else {
        log.warning('DATABASE_URL no encontrado en variables de entorno');
        diagnosticResults.warnings.push('DATABASE_URL faltante');
      }
    }
  });
  
  if (!envFileFound) {
    log.warning('No se encontraron archivos de entorno (.env, .env.local)');
    diagnosticResults.warnings.push('Archivos de entorno faltantes');
    diagnosticResults.fixes.push('Crear archivo .env.local con variables necesarias');
  }
}

// Verificar problemas específicos de Windows
function checkWindowsIssues() {
  if (os.platform() !== 'win32') return;
  
  log.header('🪟 Verificando problemas específicos de Windows...');
  
  // Verificar cache problemático de Vite
  if (fs.existsSync('node_modules/.vite')) {
    const stats = fs.statSync('node_modules/.vite');
    const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours > 24) {
      log.warning('Cache de Vite antiguo detectado');
      diagnosticResults.warnings.push('Cache de Vite obsoleto');
      diagnosticResults.fixes.push('Limpiar cache: rm -rf node_modules/.vite');
    } else {
      log.success('Cache de Vite reciente');
    }
  }
  
  // Verificar permisos de archivos problemáticos
  const problematicPaths = [
    'node_modules/.vite',
    '.next',
    'coverage'
  ];
  
  problematicPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.accessSync(dir, fs.constants.W_OK);
        log.success(`Permisos OK: ${dir}`);
      } catch (error) {
        log.warning(`Problemas de permisos: ${dir}`);
        diagnosticResults.warnings.push(`Permisos problemáticos en ${dir}`);
        diagnosticResults.fixes.push(`Eliminar directorio problemático: ${dir}`);
      }
    }
  });
}

// Verificar scripts de package.json
function checkPackageScripts() {
  log.header('📜 Verificando scripts de package.json...');
  
  if (!fs.existsSync('package.json')) {
    log.error('package.json no encontrado');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const expectedScripts = [
    'dev',
    'build',
    'start',
    'check',
    'db:push'
  ];
  
  expectedScripts.forEach(script => {
    if (scripts[script]) {
      log.success(`Script '${script}' definido`);
      diagnosticResults.successes.push(`Script ${script} OK`);
    } else {
      log.warning(`Script '${script}' no encontrado`);
      diagnosticResults.warnings.push(`Script ${script} faltante`);
    }
  });
}

// Verificar conectividad de red (para base de datos)
function checkNetworkConnectivity() {
  log.header('🌐 Verificando conectividad de red...');
  
  // Verificar si hay DATABASE_URL configurado
  // dotenv se carga automáticamente en el servidor principal
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes('dummy')) {
    log.warning('DATABASE_URL no configurado para producción');
    diagnosticResults.warnings.push('DATABASE_URL usa valores dummy');
    diagnosticResults.fixes.push('Configurar DATABASE_URL real para base de datos');
    return;
  }
  
  try {
    const url = new URL(databaseUrl);
    log.success(`Base de datos configurada: ${url.protocol}//${url.hostname}:${url.port}`);
    diagnosticResults.successes.push('DATABASE_URL configurado');
  } catch (error) {
    log.error('DATABASE_URL tiene formato inválido');
    diagnosticResults.errors.push('DATABASE_URL malformado');
    diagnosticResults.fixes.push('Corregir formato de DATABASE_URL');
  }
}

// Verificar puertos disponibles
function checkPortAvailability() {
  log.header('🔌 Verificando disponibilidad de puertos...');
  
  import('net').then(net => {
  const ports = [5000, 3000];
  
  ports.forEach(port => {
    const server = net.createServer();
    
    server.listen(port, (err) => {
      if (err) {
        log.warning(`Puerto ${port} ocupado`);
        diagnosticResults.warnings.push(`Puerto ${port} en uso`);
        diagnosticResults.fixes.push(`Liberar puerto ${port} o usar otro puerto`);
      } else {
        log.success(`Puerto ${port} disponible`);
        diagnosticResults.successes.push(`Puerto ${port} libre`);
        server.close();
      }
    });
    
    server.on('error', (err) => {
      log.warning(`Puerto ${port} ocupado`);
      diagnosticResults.warnings.push(`Puerto ${port} en uso`);
    });
  });
}

// Generar reporte final
function generateReport() {
  log.divider();
  log.header('📊 REPORTE DE DIAGNÓSTICO');
  log.divider();
  
  console.log(`${colors.green}✅ Éxitos: ${diagnosticResults.successes.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Advertencias: ${diagnosticResults.warnings.length}${colors.reset}`);
  console.log(`${colors.red}❌ Errores: ${diagnosticResults.errors.length}${colors.reset}`);
  console.log(`${colors.blue}🔧 Soluciones sugeridas: ${diagnosticResults.fixes.length}${colors.reset}`);
  
  if (diagnosticResults.errors.length > 0) {
    console.log(`\n${colors.red}${colors.bright}ERRORES CRÍTICOS:${colors.reset}`);
    diagnosticResults.errors.forEach((error, i) => {
      console.log(`${colors.red}${i + 1}. ${error}${colors.reset}`);
    });
  }
  
  if (diagnosticResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}${colors.bright}ADVERTENCIAS:${colors.reset}`);
    diagnosticResults.warnings.forEach((warning, i) => {
      console.log(`${colors.yellow}${i + 1}. ${warning}${colors.reset}`);
    });
  }
  
  if (diagnosticResults.fixes.length > 0) {
    console.log(`\n${colors.blue}${colors.bright}SOLUCIONES SUGERIDAS:${colors.reset}`);
    diagnosticResults.fixes.forEach((fix, i) => {
      console.log(`${colors.blue}${i + 1}. ${fix}${colors.reset}`);
    });
  }
  
  // Determinar estado general
  const totalIssues = diagnosticResults.errors.length + diagnosticResults.warnings.length;
  
  log.divider();
  if (totalIssues === 0) {
    log.success('🎉 ¡Proyecto en excelente estado!');
    console.log(`${colors.green}El proyecto está listo para desarrollo.${colors.reset}`);
  } else if (diagnosticResults.errors.length === 0) {
    log.warning('⚡ Proyecto funcional con advertencias menores');
    console.log(`${colors.yellow}El proyecto debería funcionar, pero hay mejoras posibles.${colors.reset}`);
  } else {
    log.error('🚨 Proyecto requiere atención');
    console.log(`${colors.red}Hay errores críticos que deben resolverse antes del desarrollo.${colors.reset}`);
  }
  
  log.divider();
}

// Función principal de diagnóstico
async function runDiagnosis() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('██╗    ██╗ █████╗  ██████╗ ██╗  ██╗');
  console.log('██║    ██║██╔══██╗██╔═══██╗██║ ██╔╝');
  console.log('██║ █╗ ██║███████║██║   ██║█████╔╝ ');
  console.log('██║███╗██║██╔══██║██║   ██║██╔═██╗ ');
  console.log('╚███╔███╔╝██║  ██║╚██████╔╝██║  ██╗');
  console.log(' ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝');
  console.log(`${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}WAOK-Schedule - Sistema de Diagnóstico v1.0${colors.reset}`);
  console.log(`${colors.cyan}Analizando el estado del proyecto...${colors.reset}\n`);
  
  try {
    checkNodeAndNpm();
    checkEssentialFiles();
    checkDependencies();
    checkEnvironmentVariables();
    checkWindowsIssues();
    checkPackageScripts();
    checkNetworkConnectivity();
    
    // Esperar un poco antes de verificar puertos
    setTimeout(() => {
      checkPortAvailability();
      
      // Generar reporte final después de todas las verificaciones
      setTimeout(generateReport, 1000);
    }, 500);
    
  } catch (error) {
    log.error(`Error durante el diagnóstico: ${error.message}`);
    diagnosticResults.errors.push(`Error de diagnóstico: ${error.message}`);
    generateReport();
  }
}

// Función para limpiar problemas automáticamente
function autoFix() {
  log.header('🔧 Intentando reparaciones automáticas...');
  
  // Limpiar cachés problemáticos
  const cacheDirs = ['node_modules/.vite', '.next', 'coverage', 'dist'];
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        log.success(`Cache eliminado: ${dir}`);
      } catch (error) {
        log.warning(`No se pudo eliminar: ${dir}`);
      }
    }
  });
  
  // Reinstalar dependencias críticas
  const criticalDeps = ['drizzle-zod', 'cross-env', 'tsx'];
  criticalDeps.forEach(dep => {
    try {
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
      log.success(`Dependencia reinstalada: ${dep}`);
    } catch (error) {
      log.warning(`Error reinstalando: ${dep}`);
    }
  });
  
  // Crear .env.local si no existe
  if (!fs.existsSync('.env.local')) {
    const defaultEnv = `# WAOK-Schedule - Variables de Entorno para Desarrollo Local
# Generado automáticamente por el sistema de diagnóstico

# Base de datos (reemplazar con URL real)
DATABASE_URL="postgresql://postgres:password@localhost:5432/waok_dev"

# Configuración del servidor
NODE_ENV=development
PORT=5000

# Secreto de sesión (cambiar en producción)
SESSION_SECRET="waok-dev-secret-$(Date.now())"

# Configuración de Vite
VITE_APP_TITLE="WAOK Schedule"
VITE_API_BASE_URL="http://localhost:5000"

# Configuración para desarrollo
REPL_ID="local-dev"
`;
    
    fs.writeFileSync('.env.local', defaultEnv);
    log.success('Archivo .env.local creado con valores por defecto');
  }
  
  log.success('Reparaciones automáticas completadas');
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--fix') || args.includes('-f')) {
  autoFix();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bright}WAOK-Schedule - Sistema de Diagnóstico${colors.reset}`);
  console.log('\nUso:');
  console.log('  node scripts/diagnose.js          Ejecutar diagnóstico completo');
  console.log('  node scripts/diagnose.js --fix    Ejecutar diagnóstico y reparaciones automáticas');
  console.log('  node scripts/diagnose.js --help   Mostrar esta ayuda');
  console.log('');
} else {
  runDiagnosis();
}

// Exportar para uso como módulo
module.exports = {
  runDiagnosis,
  autoFix,
  checkNodeAndNpm,
  checkEssentialFiles,
  checkDependencies,
  checkEnvironmentVariables,
  checkWindowsIssues,
  diagnosticResults
};