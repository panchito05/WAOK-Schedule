#!/usr/bin/env node

/**
 * WAOK-Schedule - Quick Health Check
 * Verificación rápida y simple del estado del proyecto
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.cyan}\n${msg}${colors.reset}`)
};

// Contadores
let passed = 0;
let failed = 0;
let warnings = 0;

function check(name, testFn) {
  try {
    const result = testFn();
    if (result === true) {
      log.success(name);
      passed++;
    } else if (result === 'warning') {
      log.warning(name);
      warnings++;
    } else {
      log.error(name);
      failed++;
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    failed++;
  }
}

// Verificaciones rápidas
function quickHealthCheck() {
  log.title('🚀 WAOK-Schedule - Quick Health Check');
  
  // Node.js
  check('Node.js instalado', () => {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    return majorVersion >= 16 ? true : 'warning';
  });
  
  // npm
  check('npm disponible', () => {
    execSync('npm --version', { stdio: 'pipe' });
    return true;
  });
  
  // Archivos esenciales
  const essentialFiles = [
    'package.json',
    'server/index.ts',
    'tsconfig.json'
  ];
  
  essentialFiles.forEach(file => {
    check(`${file} existe`, () => {
      return fs.existsSync(path.join(projectRoot, file));
    });
  });
  
  // .env.local
  check('.env.local configurado', () => {
    const envPath = path.join(projectRoot, '.env.local');
    if (!fs.existsSync(envPath)) return 'warning';
    
    const content = fs.readFileSync(envPath, 'utf8');
    return content.includes('NODE_ENV=') && content.includes('PORT=');
  });
  
  // node_modules
  check('Dependencias instaladas', () => {
    return fs.existsSync(path.join(projectRoot, 'node_modules'));
  });
  
  // Dependencias críticas
  const criticalDeps = ['drizzle-zod', 'cross-env', 'tsx'];
  criticalDeps.forEach(dep => {
    check(`${dep} instalado`, () => {
      return fs.existsSync(path.join(projectRoot, 'node_modules', dep));
    });
  });
  
  // TypeScript compilación
  check('TypeScript compila', () => {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: projectRoot });
      return true;
    } catch {
      return 'warning';
    }
  });
  
  // Puerto disponible
  check('Puerto 5000 disponible', () => {
    try {
      // execSync ya importado al inicio del archivo
      if (process.platform === 'win32') {
        const result = execSync('netstat -an | findstr :5000', { encoding: 'utf8', stdio: 'pipe' });
        return result.trim() === '' ? true : 'warning';
      } else {
        const result = execSync('lsof -i :5000', { encoding: 'utf8', stdio: 'pipe' });
        return result.trim() === '' ? true : 'warning';
      }
    } catch {
      return true; // Si falla el comando, asumimos que está disponible
    }
  });
  
  // Resumen
  console.log('\n' + '='.repeat(50));
  log.title('📊 RESUMEN');
  console.log(`   ✅ Exitosas: ${passed}`);
  console.log(`   ⚠️ Advertencias: ${warnings}`);
  console.log(`   ❌ Fallas: ${failed}`);
  
  // Recomendaciones
  console.log('\n🎯 RECOMENDACIONES:');
  if (failed > 0) {
    console.log('   🔧 Ejecuta: init.bat --force');
    console.log('   🔧 O ejecuta: npm run super-setup');
  } else if (warnings > 0) {
    console.log('   🔧 Ejecuta: init.bat');
    console.log('   🔧 O ejecuta: npm run setup');
  } else {
    console.log('   🚀 ¡Todo está funcionando!');
    console.log('   🚀 Puedes ejecutar: npm run dev:win');
  }
  
  console.log('='.repeat(50));
  
  // Código de salida
  if (failed > 0) {
    process.exit(1);
  } else if (warnings > 0) {
    process.exit(2);
  } else {
    process.exit(0);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  quickHealthCheck();
}

export { quickHealthCheck };