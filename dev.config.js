// WAOK-Schedule - Configuración de Desarrollo Unificada
// Este archivo centraliza las configuraciones para diferentes entornos

import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para compatibilidad con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detectar el entorno de ejecución
const isWindows = os.platform() === 'win32';
const isDocker = process.env.DOCKER_ENV === 'true';
const isReplit = process.env.REPL_ID !== undefined;
const isLocal = !isDocker && !isReplit;

// Configuración base
const baseConfig = {
  // Puerto del servidor
  port: process.env.PORT || 5000,
  
  // Host para bind
  host: isLocal ? 'localhost' : '0.0.0.0',
  
  // Configuración de la base de datos
  database: {
    // URL por defecto para desarrollo local
    defaultUrl: 'postgresql://postgres:password@localhost:5432/waok_dev',
    
    // Configuración SSL para diferentes entornos
    ssl: isLocal ? false : { rejectUnauthorized: false },
    
    // Pool de conexiones
    pool: {
      min: 1,
      max: isLocal ? 5 : 20,
      idleTimeoutMillis: 30000
    }
  },
  
  // Configuración de desarrollo
  dev: {
    // Auto-reload en desarrollo
    watch: true,
    
    // Source maps
    sourceMaps: true,
    
    // Hot module replacement
    hmr: true,
    
    // Logging level
    logLevel: 'debug'
  },
  
  // Configuración de Vite
  vite: {
    server: {
      port: 3000,
      host: isLocal ? 'localhost' : '0.0.0.0',
      cors: true,
      proxy: {
        '/api': {
          target: `http://${isLocal ? 'localhost' : '0.0.0.0'}:5000`,
          changeOrigin: true,
          secure: false
        }
      }
    },
    
    // Optimización para Windows
    optimizeDeps: {
      force: isWindows,
      include: [
        'react',
        'react-dom',
        'drizzle-orm',
        'express'
      ]
    },
    
    // Cache configuration
    cacheDir: isWindows ? 
      path.join(process.cwd(), 'node_modules', '.vite-cache') :
      '.vite'
  },
  
  // Scripts optimizados por plataforma
  scripts: {
    // Comando para iniciar desarrollo
    dev: isWindows ? 
      'cross-env NODE_ENV=development tsx watch server/index.ts' :
      'NODE_ENV=development tsx watch server/index.ts',
    
    // Comando para build
    build: isWindows ?
      'cross-env NODE_ENV=production npm run build:client && npm run build:server' :
      'NODE_ENV=production npm run build:client && npm run build:server',
    
    // Comando para tests
    test: isWindows ?
      'cross-env NODE_ENV=test vitest' :
      'NODE_ENV=test vitest'
  },
  
  // Variables de entorno requeridas
  requiredEnvVars: [
    'DATABASE_URL',
    'SESSION_SECRET'
  ],
  
  // Variables de entorno opcionales con valores por defecto
  defaultEnvVars: {
    NODE_ENV: 'development',
    PORT: '5000',
    VITE_APP_TITLE: 'WAOK Schedule',
    VITE_API_BASE_URL: 'http://localhost:5000'
  }
};

// Configuraciones específicas por entorno
const environmentConfigs = {
  // Configuración para desarrollo local
  local: {
    ...baseConfig,
    database: {
      ...baseConfig.database,
      url: process.env.DATABASE_URL || baseConfig.database.defaultUrl
    }
  },
  
  // Configuración para Docker
  docker: {
    ...baseConfig,
    host: '0.0.0.0',
    database: {
      ...baseConfig.database,
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@db:5432/waok_dev'
    }
  },
  
  // Configuración para Replit
  replit: {
    ...baseConfig,
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    database: {
      ...baseConfig.database,
      ssl: { rejectUnauthorized: false }
    }
  }
};

// Seleccionar configuración según el entorno
function getConfig() {
  if (isDocker) {
    console.log('🐳 Usando configuración para Docker');
    return environmentConfigs.docker;
  } else if (isReplit) {
    console.log('🔄 Usando configuración para Replit');
    return environmentConfigs.replit;
  } else {
    console.log('💻 Usando configuración para desarrollo local');
    return environmentConfigs.local;
  }
}

// Validar variables de entorno
function validateEnvironment(config) {
  const missing = [];
  
  config.requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.warn('⚠️  Variables de entorno faltantes:', missing.join(', '));
    console.warn('Usando valores por defecto donde sea posible...');
  }
  
  // Establecer valores por defecto
  Object.entries(config.defaultEnvVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

// Función para imprimir información del entorno
function printEnvironmentInfo(config) {
  console.log('\n=== WAOK-Schedule - Información del Entorno ===');
  console.log(`🖥️  Plataforma: ${os.platform()} ${os.arch()}`);
  console.log(`📦 Node.js: ${process.version}`);
  console.log(`🌐 Host: ${config.host}`);
  console.log(`🔌 Puerto: ${config.port}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
  
  if (process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log(`🗄️  Base de datos: ${dbUrl.protocol}//${dbUrl.hostname}:${dbUrl.port}${dbUrl.pathname}`);
  } else {
    console.log('🗄️  Base de datos: No configurada (usando valores por defecto)');
  }
  
  console.log('==============================================\n');
}

// Exportar configuración y utilidades
module.exports = {
  getConfig,
  validateEnvironment,
  printEnvironmentInfo,
  isWindows,
  isDocker,
  isReplit,
  isLocal
};

// Si este archivo se ejecuta directamente, mostrar la configuración
if (require.main === module) {
  const config = getConfig();
  validateEnvironment(config);
  printEnvironmentInfo(config);
  
  console.log('📋 Configuración completa:');
  console.log(JSON.stringify(config, null, 2));
}