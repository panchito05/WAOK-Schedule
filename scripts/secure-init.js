#!/usr/bin/env node

/**
 * ARCHITECT-AI Secure Initialization System
 * Sistema de inicialización ultra-robusto que garantiza arranque sin fallos
 * Elimina problemas de logs truncados y proporciona diagnóstico completo
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import readline from 'readline';
import net from 'net';
import dns from 'dns';
import semver from 'semver';
import { promisify } from 'util';

const execAsync = promisify(execSync);
const dnsLookup = promisify(dns.lookup);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Fases de inicialización para un control granular
const INITIALIZATION_PHASES = {
    PREFLIGHT: 'preflight',
    CLEANUP: 'cleanup',
    DEPENDENCIES: 'dependencies',
    CONFIGURATION: 'configuration',
    VALIDATION: 'validation',
    STARTUP: 'startup'
  };


// =

class SecureLogger {
  constructor() {
    this.logFile = path.join(projectRoot, 'logs', `secure-init-${Date.now()}.log`);
    this.ensureLogDirectory();
    this.logStream = createWriteStream(this.logFile, { flags: 'a' });
    this.colors = {
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
  }

  ensureLogDirectory() {
    const logDir = path.join(projectRoot, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  writeToFile(message) {
    const timestamp = new Date().toISOString();
    this.logStream.write(`[${timestamp}] ${message}\n`);
  }

  log(message, level = 'INFO', color = 'white') {
    const timestamp = new Date().toISOString();
    const colorCode = this.colors[color] || this.colors.white;
    const resetCode = this.colors.reset;
    
    // Escribir a archivo sin colores
    this.writeToFile(`[${level}] ${message}`);
    
    // Escribir a consola con colores
    console.log(`${colorCode}[${timestamp}] [${level}] ${message}${resetCode}`);
  }

  info(message) { this.log(message, 'INFO', 'blue'); }
  success(message) { this.log(message, 'SUCCESS', 'green'); }
  warning(message) { this.log(message, 'WARNING', 'yellow'); }
  error(message) { this.log(message, 'ERROR', 'red'); }
  critical(message) { this.log(message, 'CRITICAL', 'red'); }
  header(message) { 
    const separator = '='.repeat(80);
    this.log(separator, 'HEADER', 'cyan');
    this.log(`🚀 ${message}`, 'HEADER', 'cyan');
    this.log(separator, 'HEADER', 'cyan');
  }
  step(current, total, message) {
    this.log(`[${current}/${total}] ${message}`, 'STEP', 'magenta');
  }

  close() {
    this.logStream.end();
  }
}

// =============================================================================
// SISTEMA DE VALIDACIÓN Y RECUPERACIÓN
// =============================================================================

class SecureInitializer {
  constructor() {
    this.logger = new SecureLogger();
    this.state = {
      errors: [],
      warnings: [],
      fixes: [],
      startTime: Date.now(),
      phase: 'INITIALIZATION'
    };
    this.maxRetries = 3;
    this.timeout = 300000; // 5 minutos
  }

  // Ejecutar comando con timeout y reintentos
  async executeWithRetry(command, options = {}) {
    const maxRetries = options.retries || this.maxRetries;
    const timeout = options.timeout || 60000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`Ejecutando: ${command} (intento ${attempt}/${maxRetries})`);
        
        const result = await this.executeWithTimeout(command, timeout, options);
        this.logger.success(`Comando exitoso: ${command}`);
        return result;
        
      } catch (error) {
        this.logger.warning(`Intento ${attempt} falló: ${error.message}`);
        
        if (attempt === maxRetries) {
          this.logger.error(`Comando falló después de ${maxRetries} intentos: ${command}`);
          throw error;
        }
        
        // Esperar antes del siguiente intento
        await this.sleep(2000 * attempt);
      }
    }
  }

  // Ejecutar comando con timeout
  executeWithTimeout(command, timeout, options = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout: ${command} tardó más de ${timeout}ms`));
      }, timeout);

      try {
        const result = execSync(command, {
          encoding: 'utf8',
          stdio: options.silent ? 'pipe' : 'inherit',
          maxBuffer: 50 * 1024 * 1024, // 50MB buffer
          ...options
        });
        
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Verificaciones previas críticas
  async preFlightChecks() {
    this.logger.header('VERIFICACIONES PREVIAS CRÍTICAS');
    this.state.phase = 'PREFLIGHT';
    
    const checks = [
      { name: 'Node.js', fn: () => this.checkNodeJS() },
      { name: 'npm', fn: () => this.checkNpm() },
      { name: 'Permisos', fn: () => this.checkPermissions() },
      { name: 'Estructura', fn: () => this.checkProjectStructure() },
      { name: 'Puertos', fn: () => this.validateRequiredPorts([3000, 5000, 5173, 5432]) }
    ];

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      this.logger.step(i + 1, checks.length, `Verificando ${check.name}...`);
      
      try {
        await check.fn();
        this.logger.success(`✅ ${check.name} verificado`);
      } catch (error) {
        this.logger.error(`❌ Error en ${check.name}: ${error.message}`);
        this.state.errors.push(`${check.name}: ${error.message}`);
        
        // Intentar reparación automática
        await this.attemptAutoFix(check.name, error);
      }
    }

    if (this.state.errors.length > 0) {
      throw new Error(`Verificaciones previas fallaron: ${this.state.errors.join(', ')}`);
    }
  }

  async checkNodeJS() {
    const version = await this.executeWithRetry('node --version', { silent: true });
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js ${version} es demasiado antiguo. Requerido: v18+`);
    }
    
    this.logger.info(`Node.js ${version} ✓`);
  }

  async checkNpm() {
    const version = await this.executeWithRetry('npm --version', { silent: true });
    this.logger.info(`npm ${version} ✓`);
  }

  async checkPermissions() {
    const testFile = path.join(projectRoot, '.write-test-' + Date.now());
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      this.logger.info('Permisos de escritura ✓');
    } catch (error) {
      throw new Error('Sin permisos de escritura en el directorio del proyecto');
    }
  }

  async checkProjectStructure() {
    const required = ['package.json', 'server', 'client', 'shared'];
    const missing = required.filter(item => !fs.existsSync(path.join(projectRoot, item)));
    
    if (missing.length > 0) {
      throw new Error(`Archivos/directorios faltantes: ${missing.join(', ')}`);
    }
    
    this.logger.info('Estructura del proyecto ✓');
  }

  async checkPorts() {
    const ports = [5000, 3000];
    for (const port of ports) {
      try {
        await this.executeWithRetry(`netstat -an | findstr :${port}`, { silent: true, timeout: 5000 });
        this.logger.warning(`Puerto ${port} puede estar en uso`);
        this.state.warnings.push(`Puerto ${port} ocupado`);
      } catch {
        // Puerto libre, esto es bueno
      }
    }
    this.logger.info('Puertos verificados ✓');
  }

  // Reparación automática de problemas comunes
  async attemptAutoFix(checkName, error) {
    this.logger.info(`🔧 Intentando reparación automática para: ${checkName}`);
    
    switch (checkName) {
      case 'Permisos':
        try {
          if (os.platform() === 'win32') {
            // En Windows, intentar ejecutar como administrador
            this.logger.warning('Considere ejecutar como administrador en Windows');
          }
        } catch (fixError) {
          this.logger.warning(`Auto-fix falló: ${fixError.message}`);
        }
        break;
        
      case 'Puertos':
        // Intentar liberar puertos
        await this.killProcessOnPort(5000);
        await this.killProcessOnPort(3000);
        break;
    }
  }

  async killProcessOnPort(port) {
    try {
      if (os.platform() === 'win32') {
        await this.executeWithRetry(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`, { silent: true });
      } else {
        await this.executeWithRetry(`lsof -ti:${port} | xargs kill -9`, { silent: true });
      }
      this.logger.success(`Proceso en puerto ${port} terminado`);
      this.state.fixes.push(`Puerto ${port} liberado`);
    } catch {
      // No hay proceso o ya está libre
    }
  }

  // Limpieza inteligente del proyecto
  async intelligentCleanup() {
    this.logger.header('LIMPIEZA INTELIGENTE DEL PROYECTO');
    this.state.phase = 'CLEANUP';
    
    const cleanupTargets = [
      { path: 'node_modules/.vite', desc: 'Caché de Vite', critical: false },
      { path: 'node_modules/.cache', desc: 'Caché de Node', critical: false },
      { path: '.next', desc: 'Caché de Next.js', critical: false },
      { path: 'coverage', desc: 'Reportes de cobertura', critical: false },
      { path: 'dist', desc: 'Build anterior', critical: false },
      { path: '.parcel-cache', desc: 'Caché de Parcel', critical: false }
    ];

    for (const target of cleanupTargets) {
      const fullPath = path.join(projectRoot, target.path);
      if (fs.existsSync(fullPath)) {
        try {
          this.logger.info(`Limpiando ${target.desc}...`);
          if (os.platform() === 'win32') {
            await this.executeWithRetry(`rmdir /s /q "${fullPath}"`, { silent: true });
          } else {
            await this.executeWithRetry(`rm -rf "${fullPath}"`, { silent: true });
          }
          this.logger.success(`${target.desc} limpiado ✓`);
          this.state.fixes.push(`Limpiado: ${target.desc}`);
        } catch (error) {
          if (target.critical) {
            throw error;
          }
          this.logger.warning(`No se pudo limpiar ${target.desc}: ${error.message}`);
        }
      }
    }
  }

  // Instalación robusta de dependencias
  async robustInstallation() {
    this.logger.header('INSTALACIÓN ROBUSTA DE DEPENDENCIAS');
    this.state.phase = 'INSTALLATION';
    
    // Verificar e instalar dependencias críticas primero
    const criticalDeps = [
      'cross-env',
      'tsx',
      'rimraf',
      'drizzle-zod'
    ];

    this.logger.info('Instalando dependencias críticas...');
    for (const dep of criticalDeps) {
      try {
        await this.executeWithRetry(`npm install ${dep} --save`, { timeout: 120000 });
        this.logger.success(`${dep} instalado ✓`);
      } catch (error) {
        this.logger.warning(`Error instalando ${dep}: ${error.message}`);
      }
    }

    // Instalación principal con múltiples estrategias
    const strategies = [
      { cmd: 'npm ci --prefer-offline', desc: 'Instalación rápida (ci)' },
      { cmd: 'npm install --no-audit --no-fund', desc: 'Instalación estándar' },
      { cmd: 'npm install --legacy-peer-deps', desc: 'Instalación con deps legacy' },
      { cmd: 'npm install --force', desc: 'Instalación forzada (último recurso)' }
    ];

    for (const strategy of strategies) {
      try {
        this.logger.info(`Probando: ${strategy.desc}`);
        await this.executeWithRetry(strategy.cmd, { timeout: 300000 });
        this.logger.success(`✅ Dependencias instaladas con: ${strategy.desc}`);
        break;
      } catch (error) {
        this.logger.warning(`❌ Falló ${strategy.desc}: ${error.message}`);
        if (strategy === strategies[strategies.length - 1]) {
          throw new Error('Todas las estrategias de instalación fallaron');
        }
      }
    }
  }

  // Validación post-instalación
  async postInstallValidation() {
    this.logger.header('VALIDACIÓN POST-INSTALACIÓN');
    this.state.phase = 'VALIDATION';

    const validations = [
      { name: 'Dependencias críticas', fn: () => this.validateCriticalDeps() },
      { name: 'Scripts de package.json', fn: () => this.validatePackageScripts() },
      { name: 'Variables de entorno', fn: () => this.validateEnvironment() },
      { name: 'Base de datos', fn: () => this.validateDatabase() }
    ];

    for (let i = 0; i < validations.length; i++) {
      const validation = validations[i];
      this.logger.step(i + 1, validations.length, `Validando ${validation.name}...`);
      
      try {
        await validation.fn();
        this.logger.success(`✅ ${validation.name} válido`);
      } catch (error) {
        this.logger.error(`❌ ${validation.name} inválido: ${error.message}`);
        this.state.errors.push(`${validation.name}: ${error.message}`);
      }
    }
  }

  async validateCriticalDeps() {
    const critical = ['tsx', 'cross-env', 'drizzle-zod'];
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const missing = critical.filter(dep => !allDeps[dep]);
    if (missing.length > 0) {
      throw new Error(`Dependencias críticas faltantes: ${missing.join(', ')}`);
    }
  }

  async validatePackageScripts() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const required = ['dev', 'build', 'start'];
    const missing = required.filter(script => !packageJson.scripts[script]);
    
    if (missing.length > 0) {
      throw new Error(`Scripts faltantes: ${missing.join(', ')}`);
    }
  }

  async validateEnvironment() {
    const envFiles = ['.env', '.env.local', '.env.example'];
    const existing = envFiles.filter(file => fs.existsSync(path.join(projectRoot, file)));
    
    if (existing.length === 0) {
      this.logger.warning('No se encontraron archivos de entorno');
      this.state.warnings.push('Sin archivos .env');
    }
  }

  async validateDatabase() {
    const dbFiles = ['drizzle.config.ts', 'drizzle.config.js'];
    const hasConfig = dbFiles.some(file => fs.existsSync(path.join(projectRoot, file)));
    
    if (!hasConfig) {
      this.logger.warning('No se encontró configuración de Drizzle');
      this.state.warnings.push('Sin config de DB');
    }
  }

  // Inicialización segura de servicios
  async safeServiceStart() {
    this.logger.header('INICIO SEGURO DE SERVICIOS');
    this.state.phase = 'SERVICE_START';

    // Preparar base de datos
    try {
      this.logger.info('Preparando base de datos...');
      await this.executeWithRetry('npm run db:push', { timeout: 60000 });
      this.logger.success('Base de datos preparada ✓');
    } catch (error) {
      this.logger.warning(`DB no disponible: ${error.message}`);
      this.state.warnings.push('DB no inicializada');
    }

    // Verificar build
    try {
      this.logger.info('Verificando build...');
      await this.executeWithRetry('npm run build', { timeout: 180000 });
      this.logger.success('Build exitoso ✓');
    } catch (error) {
      this.logger.warning(`Build falló: ${error.message}`);
      this.state.warnings.push('Build falló');
    }
  }

  // Monitoreo y diagnóstico continuo
  async continuousMonitoring() {
    this.logger.header('INICIANDO MONITOREO CONTINUO');
    
    // Crear script de monitoreo
    const monitorScript = this.generateMonitoringScript();
    const monitorPath = path.join(projectRoot, 'scripts', 'monitor.js');
    
    fs.writeFileSync(monitorPath, monitorScript);
    this.logger.success('Script de monitoreo creado ✓');
    
    return monitorPath;
  }

  generateMonitoringScript() {
    return `#!/usr/bin/env node

/**
 * ARCHITECT-AI Continuous Monitoring System
 * Monitoreo continuo del estado del sistema
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class SystemMonitor {
  constructor() {
    this.checks = {
      memory: () => this.checkMemory(),
      cpu: () => this.checkCPU(),
      disk: () => this.checkDisk(),
      ports: () => this.checkPorts(),
      processes: () => this.checkProcesses()
    };
  }

  async runChecks() {
    console.log('🔍 Ejecutando chequeos del sistema...');
    const results = {};
    
    for (const [name, check] of Object.entries(this.checks)) {
      try {
        results[name] = await check();
        console.log(\`✅ \${name}: OK\`);
      } catch (error) {
        results[name] = { error: error.message };
        console.log(\`❌ \${name}: \${error.message}\`);
      }
    }
    
    return results;
  }

  checkMemory() {
    const stats = process.memoryUsage();
    return {
      rss: Math.round(stats.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(stats.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(stats.heapTotal / 1024 / 1024) + 'MB'
    };
  }

  checkCPU() {
    return { usage: process.cpuUsage() };
  }

  checkDisk() {
    try {
      const stats = fs.statSync(process.cwd());
      return { accessible: true, modified: stats.mtime };
    } catch (error) {
      throw new Error('Directorio no accesible');
    }
  }

  checkPorts() {
    const ports = [3000, 5000];
    const results = {};
    
    ports.forEach(port => {
      try {
        execSync(\`netstat -an | findstr :\${port}\`, { stdio: 'pipe' });
        results[port] = 'En uso';
      } catch {
        results[port] = 'Libre';
      }
    });
    
    return results;
  }

  checkProcesses() {
    try {
      const processes = execSync('tasklist /FI "IMAGENAME eq node.exe"', { encoding: 'utf8' });
      const lines = processes.split('\\n').filter(line => line.includes('node.exe'));
      return { count: lines.length, active: lines.length > 0 };
    } catch {
      return { count: 0, active: false };
    }
  }
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const monitor = new SystemMonitor();
  monitor.runChecks().then(results => {
    console.log('\\n📊 Resultados del monitoreo:');
    console.log(JSON.stringify(results, null, 2));
  });
}

export default SystemMonitor;`;
  }

  // Reporte final del estado
  async generateFinalReport() {
    const duration = Date.now() - this.state.startTime;
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      phase: this.state.phase,
      status: this.state.errors.length === 0 ? 'SUCCESS' : 'WITH_ERRORS',
      errors: this.state.errors,
      warnings: this.state.warnings,
      fixes: this.state.fixes,
      system: {
        os: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: process.memoryUsage()
      }
    };

    const reportPath = path.join(projectRoot, 'logs', `init-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.logger.header('REPORTE FINAL DE INICIALIZACIÓN');
    this.logger.info(`Duración total: ${report.duration}`);
    this.logger.info(`Estado: ${report.status}`);
    this.logger.info(`Errores: ${report.errors.length}`);
    this.logger.info(`Advertencias: ${report.warnings.length}`);
    this.logger.info(`Correcciones aplicadas: ${report.fixes.length}`);
    this.logger.info(`Reporte guardado en: ${reportPath}`);
    
    return report;
  }

  // Proceso principal de inicialización
  async initialize() {
    try {
      this.logger.header('🚀 ARCHITECT-AI SECURE INITIALIZATION SYSTEM v2.0');
      this.logger.info(`Iniciando en: ${projectRoot}`);
      this.logger.info(`Plataforma: ${os.platform()} ${os.arch()}`);
      this.logger.info(`Node.js: ${process.version}`);
      
      // Fase 1: Verificaciones previas
      await this.preFlightChecks();
      
      // Fase 2: Limpieza inteligente
      await this.intelligentCleanup();
      
      // Fase 3: Instalación robusta
      await this.robustInstallation();
      
      // Fase 4: Validación post-instalación
      await this.postInstallValidation();
      
      // Fase 5: Inicio seguro de servicios
      await this.safeServiceStart();
      
      // Fase 6: Configurar monitoreo continuo
      const monitorPath = await this.continuousMonitoring();
      
      // Generar reporte final
      const report = await this.generateFinalReport();
      
      this.logger.success('🎉 INICIALIZACIÓN COMPLETADA EXITOSAMENTE');
      this.logger.info(`Monitor disponible en: ${monitorPath}`);
      
      return report;
      
    } catch (error) {
      this.logger.critical(`💥 INICIALIZACIÓN FALLÓ: ${error.message}`);
      this.state.errors.push(error.message);
      
      const report = await this.generateFinalReport();
      throw error;
    } finally {
      this.logger.close();
    }
  }
}

// =============================================================================
// PUNTO DE ENTRADA PRINCIPAL
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const initializer = new SecureInitializer();
  
  // Manejar señales del sistema
  process.on('SIGINT', () => {
    console.log('\n🛑 Inicialización interrumpida por el usuario');
    initializer.logger.close();
    process.exit(1);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Inicialización terminada');
    initializer.logger.close();
    process.exit(1);
  });
  
  // Ejecutar inicialización
  initializer.initialize()
    .then(report => {
      console.log('\n✅ Inicialización completada');
      console.log(`📄 Ver reporte completo en logs/`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Inicialización falló:', error.message);
      process.exit(1);
    });
}

export default SecureInitializer;


  // Port check
  async checkPortAvailability(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      server.on('error', () => resolve(false));
    });
  }

  // Validar una lista de puertos requeridos
  async validateRequiredPorts(ports) {
    this.logger.info('Iniciando validación de puertos requeridos...');
    const availablePorts = [];
    const unavailablePorts = [];

    for (const port of ports) {
      const isAvailable = await this.checkPortAvailability(port);
      if (isAvailable) {
        availablePorts.push(port);
      } else {
        unavailablePorts.push(port);
      }
    }

    if (unavailablePorts.length > 0) {
      const errorMsg = `Los siguientes puertos NO están disponibles: ${unavailablePorts.join(', ')}. Por favor, libéralos e intenta de nuevo.`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    } else {
      this.logger.success(`Todos los puertos requeridos (${ports.join(', ')}) están disponibles.`);
    }
  }