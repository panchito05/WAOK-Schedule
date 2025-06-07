// Sistema de configuración centralizada
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class ConfigManager extends EventEmitter {
  constructor() {
    super();
    this.config = {};
    this.configPath = path.join(__dirname, '../../config');
    this.envPath = path.join(__dirname, '../../.env');
    this.validators = new Map();
    this.watchers = new Map();
  }

  // Inicializar configuración
  async initialize() {
    try {
      // Cargar configuración por defecto
      await this.loadDefaultConfig();
      
      // Cargar configuraciones específicas del entorno
      await this.loadEnvironmentConfig();
      
      // Cargar variables de entorno
      await this.loadEnvVariables();
      
      // Validar configuración completa
      this.validateConfig();
      
      // Iniciar observadores de archivos
      this.setupFileWatchers();
      
      return this;
    } catch (error) {
      throw new Error(`Error inicializando configuración: ${error.message}`);
    }
  }

  // Cargar configuración por defecto
  async loadDefaultConfig() {
    const defaultConfig = {
      app: {
        name: 'WAOK-Schedule',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        debug: process.env.DEBUG === 'true'
      },
      server: {
        frontend: {
          port: 3000,
          host: 'localhost',
          protocol: 'http'
        },
        backend: {
          port: 5000,
          host: 'localhost',
          protocol: 'http'
        }
      },
      database: {
        client: 'sqlite3',
        filename: './database.db',
        useNullAsDefault: true,
        migrations: {
          directory: './migrations'
        },
        seeds: {
          directory: './seeds'
        }
      },
      commands: {
        retry: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 1.5
        },
        timeout: {
          default: 30000,
          long: 300000,
          short: 5000
        }
      },
      monitoring: {
        enabled: true,
        interval: 5000,
        metrics: {
          cpu: true,
          memory: true,
          disk: true,
          network: true
        },
        thresholds: {
          cpu: 80,
          memory: 85,
          disk: 90
        }
      },
      logging: {
        level: 'info',
        format: 'json',
        directory: './logs',
        maxFiles: 10,
        maxSize: '10m',
        rotate: true
      },
      rollback: {
        enabled: true,
        maxSnapshots: 5,
        directory: './snapshots'
      },
      plugins: {
        enabled: true,
        directory: './plugins',
        autoload: true
      },
      notifications: {
        enabled: false,
        channels: {
          email: {
            enabled: false,
            smtp: {
              host: '',
              port: 587,
              secure: false
            }
          },
          webhook: {
            enabled: false,
            url: ''
          },
          desktop: {
            enabled: true
          }
        }
      },
      performance: {
        cache: {
          enabled: true,
          ttl: 3600,
          maxSize: 100
        },
        compression: {
          enabled: true,
          level: 6
        }
      }
    };

    this.merge(defaultConfig);
  }

  // Cargar configuración específica del entorno
  async loadEnvironmentConfig() {
    const env = this.get('app.environment');
    const envConfigPath = path.join(this.configPath, `${env}.json`);
    
    if (fs.existsSync(envConfigPath)) {
      try {
        const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
        this.merge(envConfig);
      } catch (error) {
        console.error(`Error cargando configuración de ${env}:`, error);
      }
    }
  }

  // Cargar variables de entorno
  async loadEnvVariables() {
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
    }

    // Mapear variables de entorno a configuración
    this.mapEnvToConfig();
  }

  // Mapear variables de entorno a configuración
  mapEnvToConfig() {
    const mappings = {
      'PORT': 'server.frontend.port',
      'BACKEND_PORT': 'server.backend.port',
      'DATABASE_URL': 'database.connectionString',
      'LOG_LEVEL': 'logging.level',
      'DEBUG': 'app.debug',
      'NODE_ENV': 'app.environment'
    };

    Object.entries(mappings).forEach(([envKey, configPath]) => {
      if (process.env[envKey]) {
        this.set(configPath, process.env[envKey]);
      }
    });
  }

  // Obtener valor de configuración
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  // Establecer valor de configuración
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.config;
    
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    const oldValue = target[lastKey];
    target[lastKey] = value;
    
    // Emitir evento de cambio
    this.emit('change', {
      path,
      oldValue,
      newValue: value
    });
    
    // Ejecutar validador si existe
    if (this.validators.has(path)) {
      const validator = this.validators.get(path);
      if (!validator(value)) {
        target[lastKey] = oldValue;
        throw new Error(`Valor inválido para ${path}`);
      }
    }
  }

  // Merge configuración
  merge(config, prefix = '') {
    Object.entries(config).forEach(([key, value]) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.merge(value, fullPath);
      } else {
        this.set(fullPath, value);
      }
    });
  }

  // Validar configuración completa
  validateConfig() {
    const requiredPaths = [
      'app.name',
      'app.version',
      'server.frontend.port',
      'server.backend.port',
      'database.client'
    ];

    requiredPaths.forEach(path => {
      if (this.get(path) === undefined) {
        throw new Error(`Configuración requerida faltante: ${path}`);
      }
    });

    // Validar tipos
    this.validateType('server.frontend.port', 'number');
    this.validateType('server.backend.port', 'number');
    this.validateType('monitoring.enabled', 'boolean');
    this.validateType('logging.level', 'string');
  }

  // Validar tipo de dato
  validateType(path, expectedType) {
    const value = this.get(path);
    const actualType = typeof value;
    
    if (actualType !== expectedType) {
      throw new Error(`${path} debe ser de tipo ${expectedType}, pero es ${actualType}`);
    }
  }

  // Registrar validador personalizado
  registerValidator(path, validator) {
    if (typeof validator !== 'function') {
      throw new Error('El validador debe ser una función');
    }
    this.validators.set(path, validator);
  }

  // Configurar observadores de archivos
  setupFileWatchers() {
    // Observar archivo .env
    if (fs.existsSync(this.envPath)) {
      const watcher = fs.watch(this.envPath, async (eventType) => {
        if (eventType === 'change') {
          await this.loadEnvVariables();
          this.emit('env-reload');
        }
      });
      this.watchers.set('.env', watcher);
    }

    // Observar archivos de configuración
    if (fs.existsSync(this.configPath)) {
      const watcher = fs.watch(this.configPath, async (eventType, filename) => {
        if (eventType === 'change' && filename.endsWith('.json')) {
          await this.loadEnvironmentConfig();
          this.emit('config-reload');
        }
      });
      this.watchers.set('config', watcher);
    }
  }

  // Guardar configuración actual
  async save(path = null) {
    const env = this.get('app.environment');
    const configFile = path || path.join(this.configPath, `${env}.json`);
    
    try {
      // Crear directorio si no existe
      const dir = path.dirname(configFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Guardar configuración
      fs.writeFileSync(
        configFile,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
      
      this.emit('save', configFile);
    } catch (error) {
      throw new Error(`Error guardando configuración: ${error.message}`);
    }
  }

  // Crear snapshot de configuración
  createSnapshot(name = null) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const snapshotName = name || `config-${timestamp}`;
    const snapshotPath = path.join(
      this.get('rollback.directory'),
      `${snapshotName}.json`
    );
    
    try {
      // Crear directorio si no existe
      const dir = path.dirname(snapshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Guardar snapshot
      fs.writeFileSync(
        snapshotPath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
      
      // Limpiar snapshots antiguos
      this.cleanOldSnapshots();
      
      return snapshotPath;
    } catch (error) {
      throw new Error(`Error creando snapshot: ${error.message}`);
    }
  }

  // Limpiar snapshots antiguos
  cleanOldSnapshots() {
    const snapshotDir = this.get('rollback.directory');
    const maxSnapshots = this.get('rollback.maxSnapshots');
    
    if (!fs.existsSync(snapshotDir)) return;
    
    const files = fs.readdirSync(snapshotDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(snapshotDir, f),
        time: fs.statSync(path.join(snapshotDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // Eliminar snapshots excedentes
    if (files.length > maxSnapshots) {
      files.slice(maxSnapshots).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }

  // Restaurar desde snapshot
  async restoreSnapshot(snapshotPath) {
    try {
      if (!fs.existsSync(snapshotPath)) {
        throw new Error(`Snapshot no encontrado: ${snapshotPath}`);
      }
      
      const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
      this.config = {};
      this.merge(snapshotData);
      
      this.emit('restore', snapshotPath);
    } catch (error) {
      throw new Error(`Error restaurando snapshot: ${error.message}`);
    }
  }

  // Exportar configuración
  export(includeDefaults = false) {
    if (includeDefaults) {
      return JSON.parse(JSON.stringify(this.config));
    

  // Inicializar configuración
  async initialize() {
    try {
      // Cargar configuración por defecto
      await this.loadDefaultConfig();
      
      // Cargar configuraciones específicas del entorno
      await this.loadEnvironmentConfig();
      
      // Cargar variables de entorno
      await this.loadEnvVariables();
      
      // Validar configuración completa
      this.validateConfig();
      
      // Iniciar observadores de archivos
      this.setupFileWatchers();
      
      return this;
    } catch (error) {
      throw new Error(`Error inicializando configuración: ${error.message}`);
    }
  }

  // Cargar configuración por defecto
  async loadDefaultConfig() {
    const defaultConfig = {
      app: {
        name: 'WAOK-Schedule',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        debug: process.env.DEBUG === 'true'
      },
      server: {
        frontend: {
          port: 3000,
          host: 'localhost',
          protocol: 'http'
        },
        backend: {
          port: 5000,
          host: 'localhost',
          protocol: 'http'
        }
      },
      database: {
        client: 'sqlite3',
        filename: './database.db',
        useNullAsDefault: true,
        migrations: {
          directory: './migrations'
        },
        seeds: {
          directory: './seeds'
        }
      },
      commands: {
        retry: {
          maxAttempts: 3,
          delayMs: 1000,
          backoffMultiplier: 1.5
        },
        timeout: {
          default: 30000,
          long: 300000,
          short: 5000
        }
      },
      monitoring: {
        enabled: true,
        interval: 5000,
        metrics: {
          cpu: true,
          memory: true,
          disk: true,
          network: true
        },
        thresholds: {
          cpu: 80,
          memory: 85,
          disk: 90
        }
      },
      logging: {
        level: 'info',
        format: 'json',
        directory: './logs',
        maxFiles: 10,
        maxSize: '10m',
        rotate: true
      },
      rollback: {
        enabled: true,
        maxSnapshots: 5,
        directory: './snapshots'
      },
      plugins: {
        enabled: true,
        directory: './plugins',
        autoload: true
      },
      notifications: {
        enabled: false,
        channels: {
          email: {
            enabled: false,
            smtp: {
              host: '',
              port: 587,
              secure: false
            }
          },
          webhook: {
            enabled: false,
            url: ''
          },
          desktop: {
            enabled: true
          }
        }
      },
      performance: {
        cache: {
          enabled: true,
          ttl: 3600,
          maxSize: 100
        },
        compression: {
          enabled: true,
          level: 6
        }
      }
    };

    this.merge(defaultConfig);
  }

  // Cargar configuración específica del entorno
  async loadEnvironmentConfig() {
    const env = this.get('app.environment');
    const envConfigPath = path.join(this.configPath, `${env}.json`);
    
    if (fs.existsSync(envConfigPath)) {
      try {
        const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
        this.merge(envConfig);
      } catch (error) {
        console.error(`Error cargando configuración de ${env}:`, error);
      }
    }
  }

  // Cargar variables de entorno
  async loadEnvVariables() {
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
    }

    // Mapear variables de entorno a configuración
    this.mapEnvToConfig();
  }

  // Mapear variables de entorno a configuración
  mapEnvToConfig() {
    const mappings = {
      'PORT': 'server.frontend.port',
      'BACKEND_PORT': 'server.backend.port',
      'DATABASE_URL': 'database.connectionString',
      'LOG_LEVEL': 'logging.level',
      'DEBUG': 'app.debug',
      'NODE_ENV': 'app.environment'
    };

    Object.entries(mappings).forEach(([envKey, configPath]) => {
      if (process.env[envKey]) {
        this.set(configPath, process.env[envKey]);
      }
    });
  }

  // Obtener valor de configuración
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  // Establecer valor de configuración
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.config;
    
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    const oldValue = target[lastKey];
    target[lastKey] = value;
    
    // Emitir evento de cambio
    this.emit('change', {
      path,
      oldValue,
      newValue: value
    });
    
    // Ejecutar validador si existe
    if (this.validators.has(path)) {
      const validator = this.validators.get(path);
      if (!validator(value)) {
        target[lastKey] = oldValue;
        throw new Error(`Valor inválido para ${path}`);
      }
    }
  }

  // Merge configuración
  merge(config, prefix = '') {
    Object.entries(config).forEach(([key, value]) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.merge(value, fullPath);
      } else {
        this.set(fullPath, value);
      }
    });
  }

  // Validar configuración completa
  validateConfig() {
    const requiredPaths = [
      'app.name',
      'app.version',
      'server.frontend.port',
      'server.backend.port',
      'database.client'
    ];

    requiredPaths.forEach(path => {
      if (this.get(path) === undefined) {
        throw new Error(`Configuración requerida faltante: ${path}`);
      }
    });

    // Validar tipos
    this.validateType('server.frontend.port', 'number');
    this.validateType('server.backend.port', 'number');
    this.validateType('monitoring.enabled', 'boolean');
    this.validateType('logging.level', 'string');
  }

  // Validar tipo de dato
  validateType(path, expectedType) {
    const value = this.get(path);
    const actualType = typeof value;
    
    if (actualType !== expectedType) {
      throw new Error(`${path} debe ser de tipo ${expectedType}, pero es ${actualType}`);
    }
  }

  // Registrar validador personalizado
  registerValidator(path, validator) {
    if (typeof validator !== 'function') {
      throw new Error('El validador debe ser una función');
    }
    this.validators.set(path, validator);
  }

  // Configurar observadores de archivos
  setupFileWatchers() {
    // Observar archivo .env
    if (fs.existsSync(this.envPath)) {
      const watcher = fs.watch(this.envPath, async (eventType) => {
        if (eventType === 'change') {
          await this.loadEnvVariables();
          this.emit('env-reload');
        }
      });
      this.watchers.set('.env', watcher);
    }

    // Observar archivos de configuración
    if (fs.existsSync(this.configPath)) {
      const watcher = fs.watch(this.configPath, async (eventType, filename) => {
        if (eventType === 'change' && filename.endsWith('.json')) {
          await this.loadEnvironmentConfig();
          this.emit('config-reload');
        }
      });
      this.watchers.set('config', watcher);
    }
  }

  // Guardar configuración actual
  async save(path = null) {
    const env = this.get('app.environment');
    const configFile = path || path.join(this.configPath, `${env}.json`);
    
    try {
      // Crear directorio si no existe
      const dir = path.dirname(configFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Guardar configuración
      fs.writeFileSync(
        configFile,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
      
      this.emit('save', configFile);
    } catch (error) {
      throw new Error(`Error guardando configuración: ${error.message}`);
    }
  }

  // Crear snapshot de configuración
  createSnapshot(name = null) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const snapshotName = name || `config-${timestamp}`;
    const snapshotPath = path.join(
      this.get('rollback.directory'),
      `${snapshotName}.json`
    );
    
    try {
      // Crear directorio si no existe
      const dir = path.dirname(snapshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Guardar snapshot
      fs.writeFileSync(
        snapshotPath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
      
      // Limpiar snapshots antiguos
      this.cleanOldSnapshots();
      
      return snapshotPath;
    } catch (error) {
      throw new Error(`Error creando snapshot: ${error.message}`);
    }
  }

  // Limpiar snapshots antiguos
  cleanOldSnapshots() {
    const snapshotDir = this.get('rollback.directory');
    const maxSnapshots = this.get('rollback.maxSnapshots');
    
    if (!fs.existsSync(snapshotDir)) return;
    
    const files = fs.readdirSync(snapshotDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(snapshotDir, f),
        time: fs.statSync(path.join(snapshotDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // Eliminar snapshots excedentes
    if (files.length > maxSnapshots) {
      files.slice(maxSnapshots).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }

  // Restaurar desde snapshot
  async restoreSnapshot(snapshotPath) {
    try {
      if (!fs.existsSync(snapshotPath)) {
        throw new Error(`Snapshot no encontrado: ${snapshotPath}`);
      }
      
      const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
      this.config = {};
      this.merge(snapshotData);
      
      this.emit('restore', snapshotPath);
    } catch (error) {
      throw new Error(`Error restaurando snapshot: ${error.message}`);
    }
  }

  // Exportar configuración
  export(includeDefaults = false) {
    if (includeDefaults) {
      return JSON.parse(JSON.stringify(this.config));
    }
    
    // Exportar solo valores no predeterminados
    const defaultConfig = {};
    const temp = this.config;
    this.config = {};
    this.loadDefaultConfig();
    Object.assign(defaultConfig, this.config);
    this.config = temp;
    
    return this.diff(this.config, defaultConfig);
  }

  // Calcular diferencias entre configuraciones
  diff(current, defaults) {
    const result = {};
    
    Object.keys(current).forEach(