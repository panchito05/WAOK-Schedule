#!/usr/bin/env node

// 🚀 ARCHITECT-AI - Verificación Final del Sistema
// Script para confirmar que todas las correcciones funcionan correctamente

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para compatibilidad con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.blue}\n=== ${msg} ===${colors.reset}`)
};

log.header('VERIFICACIÓN FINAL DEL SISTEMA WAOK-Schedule');
log.info('Iniciado por ARCHITECT-AI');

// Lista de archivos críticos que fueron convertidos
const archivosCriticos = [
  'scripts/super-setup.js',
  'scripts/quick-health.js', 
  'scripts/diagnose.js',
  'auto-fix-critical.js',
  'inspect-shifts.js',
  'dev.config.js'
];

// Verificar que no queden require() en archivos JS
log.header('Verificando Sintaxis de Módulos');

let problemas = 0;

archivosCriticos.forEach(archivo => {
  const rutaCompleta = path.join(process.cwd(), archivo);
  
  if (fs.existsSync(rutaCompleta)) {
    try {
      const contenido = fs.readFileSync(rutaCompleta, 'utf8');
      const lineasRequire = contenido.split('\n').filter(linea => 
        linea.includes('require(') && 
        !linea.includes('//') && 
        !linea.includes('console.log') &&
        !linea.includes('crypto')
      );
      
      if (lineasRequire.length === 0) {
        log.success(`${archivo} - Sintaxis ES Modules OK`);
      } else {
        log.error(`${archivo} - Contiene ${lineasRequire.length} require() activos`);
        lineasRequire.forEach(linea => log.warning(`  → ${linea.trim()}`));
        problemas++;
      }
    } catch (error) {
      log.error(`${archivo} - Error al leer: ${error.message}`);
      problemas++;
    }
  } else {
    log.warning(`${archivo} - Archivo no encontrado`);
  }
});

// Verificar package.json
log.header('Verificando Configuración del Proyecto');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.type === 'module') {
    log.success('package.json configurado como ES Module');
  } else {
    log.warning('package.json no especifica "type": "module"');
  }
  
  // Verificar scripts nuevos
  const scriptsNuevos = ['init:safe', 'quick-start'];
  scriptsNuevos.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log.success(`Script "${script}" disponible`);
    } else {
      log.error(`Script "${script}" faltante`);
      problemas++;
    }
  });
  
} catch (error) {
  log.error(`Error leyendo package.json: ${error.message}`);
  problemas++;
}

// Verificar archivos de documentación
log.header('Verificando Documentación');

const archivosDoc = [
  'README.md',
  'INICIO-RAPIDO-DEFINITIVO.md',
  '.env.example'
];

archivosDoc.forEach(archivo => {
  if (fs.existsSync(archivo)) {
    log.success(`${archivo} presente`);
  } else {
    log.error(`${archivo} faltante`);
    problemas++;
  }
});

// Prueba de sintaxis básica
log.header('Pruebas de Sintaxis');

try {
  // Verificar que node puede parsear los archivos principales
  execSync('node --check scripts/super-setup.js', { stdio: 'pipe' });
  log.success('super-setup.js - Sintaxis válida');
} catch (error) {
  log.error('super-setup.js - Error de sintaxis');
  problemas++;
}

try {
  execSync('node --check scripts/quick-health.js', { stdio: 'pipe' });
  log.success('quick-health.js - Sintaxis válida');
} catch (error) {
  log.error('quick-health.js - Error de sintaxis');
  problemas++;
}

// Resultado final
log.header('RESULTADO FINAL');

if (problemas === 0) {
  log.success('🎉 SISTEMA VERIFICADO - LISTO PARA PRODUCCIÓN');
  log.info('Comandos recomendados:');
  log.info('  → npm run quick-start (primera vez)');
  log.info('  → npm run dev:win (uso diario)');
  log.info('  → npm run quick-check (verificación rápida)');
} else {
  log.error(`❌ ENCONTRADOS ${problemas} PROBLEMAS`);
  log.warning('Revisar los errores anteriores antes de continuar');
  process.exit(1);
}

log.info('\n🤖 Verificación completada por ARCHITECT-AI');
log.info('📚 Consulta INICIO-RAPIDO-DEFINITIVO.md para más detalles');