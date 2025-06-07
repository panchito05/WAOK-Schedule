// Configuración centralizada para el sistema de setup
const os = require('os');
const path = require('path');

// Configuración base del sistema
const config = {
  // Información del sistema
  platform: {
    type: os.platform(),
    arch: os.arch(),
    isWindows: os.platform() === 'win32',
    isMac: os.platform() === 'darwin',
    isLinux: os.platform() === 'linux'
  },
  
  // Rutas del proyecto
  paths: {
    root: path.resolve(__dirname, '../..'),
    scripts: path.resolve(__dirname, '..'),
    logs: path.resolve(__dirname, '../../logs'),
    backup: path.resolve(__dirname, '../../.backup'),
    temp: path.resolve(__dirname, '../../.temp'),
    node_modules: path.resolve(__dirname, '../../node_modules'),
    env: {
      local: path.resolve(__dirname, '../../.env.local'),
      development: path.resolve(__dirname, '../../.env.development'),
      production: path.resolve(__dirname, '../../.env.production')
    }
  },
  
  // Configuración de comandos
  commands: {
    retry: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      timeout: 30000
    },
    npm: {
      install: 'npm install',
      ci: 'npm ci',
      audit: 'npm audit fix',
      clean: 'npm cache clean --force'
    },
    critical: [
      'npm install',
      'npm ci',
      'npm run build',
      'npm run dev'
    ]
  },
  
  // Configuración de puertos
  ports: {
    default: 5000,
    alternatives: [5001, 5002, 3000, 3001, 8080, 8081],
    checkTimeout: 2000,
    retryDelay: 500
  },
  
  // Configuración de errores
  errors: {
    codes: {
      DEPENDENCY_INSTALL_FAILED: 'E001',
      PORT_IN_USE: 'E002',
      PERMISSION_DENIED: 'E003',
      NETWORK_ERROR: 'E004',
      FILE_NOT_FOUND: 'E005',
      INVALID_CONFIGURATION: 'E006',
      BUILD_FAILED: 'E007',
      RUNTIME_ERROR: 'E008',
      UNKNOWN_ERROR: 'E999'
    },
    messages: {
      E001: 'Fallo en la instalación de dependencias',
      E002: 'Puerto en uso',
      E003: 'Permiso denegado',
      E004: 'Error de red',
      E005: 'Archivo no encontrado',
      E006: 'Configuración inválida',
      E007: 'Fallo en la compilación',
      E008: 'Error en tiempo de ejecución',
      E999: 'Error desconocido'
    }
  },
  
  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestampFormat: 'ISO',
    maxFileSize: '10MB',
    maxFiles: 5,
    structured: true
  },
  
  // Configuración de métricas
  metrics: {
    enabled: true,
    interval: 5000,
    collectors: [
      'cpu',
      'memory',
      'disk',
      'network',
      'process'
    ]
  },
  
  // Configuración de rollback
  rollback: {
    enabled: true,
    maxSnapshots: 3,
    includeNodeModules: false,
    excludePatterns: [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'logs',
      '.temp'
    ]
  },
  
  // Configuración de notificaciones
  notifications: {
    enabled: process.env.ENABLE_NOTIFICATIONS === 'true',
    channels: {
      console: true,
      file: true,
      webhook: process.env.WEBHOOK_URL || null
    },
    events: [
      'error',
      'critical',
      'rollback',
      'success'
    ]
  },
  
  // Configuración de plugins
  plugins: {
    enabled: true,
    directory: path.resolve(__dirname, '../plugins'),
    autoLoad: true,
    required: [
      'health-check',
      'port-scanner',
      'dependency-validator'
    ]
  },
  
  // Configuración de validación
  validation: {
    nodeVersion: {
      min: '18.0.0',
      recommended: '20.0.0'
    },
    npmVersion: {
      min: '8.0.0',
      recommended: '10.0.0'
    },
    requiredCommands: [
      'node',
      'npm',
      'git'
    ],
    requiredFiles: [
      'package.json',
      'tsconfig.json',
      'vite.config.ts'
    ]
  },
  
  // Configuración de performance
  performance: {
    monitoring: true,
    thresholds: {
      cpu: 80,
      memory: 85,
      disk: 90
    },
    alerts: {
      enabled: true,
      cooldown: 300000 // 5 minutos
    }
  }
};

// Función para obtener configuración específica del OS
function getOSSpecificConfig() {
  const osConfigs = {
    win32: {
      shell: 'powershell.exe',
      shellArgs: ['-NoProfile', '-Command'],
      pathSeparator: '\\',
      commands: {
        checkPort: 'netstat -ano | findstr :',
        killProcess: 'taskkill /F /PID',
        clearScreen: 'cls'
      }
    },
    darwin: {
      shell: '/bin/bash',
      shellArgs: ['-c'],
      pathSeparator: '/',
      commands: {
        checkPort: 'lsof -i :',
        killProcess: 'kill -9',
        clearScreen: 'clear'
      }
    },
    linux: {
      shell: '/bin/bash',
      shellArgs: ['-c'],
      pathSeparator: '/',
      commands: {
        checkPort: 'lsof -i :',
        killProcess: 'kill -9',
        clearScreen: 'clear'
      }
    }
  };
  
  return osConfigs[os.platform()] || osConfigs.linux;
}

// Combinar configuración base con específica del OS
const finalConfig = {
  ...config,
  os: getOSSpecificConfig()
};

// Función para obtener configuración por clave
function get(key, defaultValue = null) {
  const keys = key.split('.');
  let value = finalConfig;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

// Función para establecer configuración dinámica
function set(key, value) {
  const keys = key.split('.');
  let obj = finalConfig;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in obj) || typeof obj[k] !== 'object') {
      obj[k] = {};
    }
    obj = obj[k];
  }
  
  obj[keys[keys.length - 1]] = value;
}

// Función para validar la configuración
function validate() {
  const required = [
    'platform.type',
    'paths.root',
    'commands.retry.maxAttempts',
    'ports.default',
    'errors.codes'
  ];
  
  const missing = [];
  
  for (const key of required) {
    if (get(key) === null) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Configuración incompleta. Faltan: ${missing.join(', ')}`);
  }
  
  return true;
}

// Exportar configuración y funciones
module.exports = {
  config: finalConfig,
  get,
  set,
  validate,
  getOSSpecificConfig
};