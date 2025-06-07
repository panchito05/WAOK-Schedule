// Sistema robusto de ejecución de comandos con reintentos y manejo de errores

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { getCurrentPlatformStrategy } from './platform-strategy.js';
import { logger } from './logger.js';
import { ErrorCodes, AppError } from './error-handler.js';

const execAsync = promisify(exec);

// Configuración por defecto para reintentos
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  backoffMultiplier: 2,
  timeout: 30000, // 30 segundos
  criticalCommands: ['npm install', 'npm run build', 'docker build', 'git clone']
};

class CommandExecutor extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.platformStrategy = getCurrentPlatformStrategy();
    this.runningProcesses = new Map();
    this.commandHistory = [];
  }

  // Ejecutar comando con reintentos automáticos
  async executeWithRetry(command, options = {}) {
    const { 
      maxRetries = this.config.maxRetries,
      retryDelay = this.config.retryDelay,
      backoffMultiplier = this.config.backoffMultiplier,
      critical = this._isCriticalCommand(command)
    } = options;

    let lastError;
    let delay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Executing command (attempt ${attempt + 1}/${maxRetries + 1}): ${command}`);
        
        const result = await this._executeCommand(command, options);
        
        // Comando exitoso
        this._recordCommand(command, 'success', attempt);
        return result;
        
      } catch (error) {
        lastError = error;
        logger.error(`Command failed (attempt ${attempt + 1}): ${error.message}`);
        
        if (attempt < maxRetries) {
          // Esperar antes de reintentar con backoff exponencial
          logger.info(`Retrying in ${delay}ms...`);
          await this._sleep(delay);
          delay *= backoffMultiplier;
          
          // Intentar limpiar estado antes de reintentar si es crítico
          if (critical) {
            await this._cleanupBeforeRetry(command, error);
          }
        }
      }
    }

    // Todos los reintentos fallaron
    this._recordCommand(command, 'failed', maxRetries);
    throw new AppError(
      ErrorCodes.COMMAND_EXECUTION_FAILED,
      `Command failed after ${maxRetries + 1} attempts: ${command}`,
      { command, attempts: maxRetries + 1, lastError: lastError.message }
    );
  }

  // Ejecutar comando asíncrono (no bloqueante)
  async executeAsync(command, options = {}) {
    const { 
      cwd = process.cwd(),
      env = process.env,
      onData,
      onError,
      onClose,
      timeout = this.config.timeout
    } = options;

    const [cmd, ...args] = this._parseCommand(command);
    const processId = this._generateProcessId();
    
    logger.info(`Starting async process ${processId}: ${command}`);

    const childProcess = spawn(cmd, args, {
      cwd,
      env,
      shell: true,
      windowsHide: true
    });

    // Guardar referencia del proceso
    this.runningProcesses.set(processId, {
      process: childProcess,
      command,
      startTime: Date.now(),
      output: [],
      errors: []
    });

    // Configurar timeout
    const timeoutId = setTimeout(() => {
      this.stopProcess(processId);
      logger.error(`Process ${processId} timed out after ${timeout}ms`);
    }, timeout);

    // Manejar salida estándar
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      this.runningProcesses.get(processId).output.push(output);
      if (onData) onData(output);
      this.emit('data', { processId, data: output });
    });

    // Manejar errores
    childProcess.stderr.on('data', (data) => {
      const error = data.toString();
      this.runningProcesses.get(processId).errors.push(error);
      if (onError) onError(error);
      this.emit('error', { processId, error });
    });

    // Manejar cierre del proceso
    childProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      const processInfo = this.runningProcesses.get(processId);
      
      if (processInfo) {
        processInfo.exitCode = code;
        processInfo.endTime = Date.now();
        processInfo.duration = processInfo.endTime - processInfo.startTime;
      }

      if (onClose) onClose(code);
      this.emit('close', { processId, code });
      
      logger.info(`Process ${processId} closed with code ${code}`);
      
      // Limpiar después de un tiempo
      setTimeout(() => this.runningProcesses.delete(processId), 60000);
    });

    return {
      processId,
      process: childProcess,
      promise: new Promise((resolve, reject) => {
        childProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ code, output: this.getProcessOutput(processId) });
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      })
    };
  }

  // Detener un proceso en ejecución
  stopProcess(processId, signal = 'SIGTERM') {
    const processInfo = this.runningProcesses.get(processId);
    
    if (!processInfo) {
      throw new AppError(
        ErrorCodes.PROCESS_NOT_FOUND,
        `Process ${processId} not found`
      );
    }

    try {
      processInfo.process.kill(signal);
      logger.info(`Sent ${signal} to process ${processId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to stop process ${processId}: ${error.message}`);
      return false;
    }
  }

  // Obtener salida de un proceso
  getProcessOutput(processId) {
    const processInfo = this.runningProcesses.get(processId);
    
    if (!processInfo) {
      return null;
    }

    return {
      output: processInfo.output.join(''),
      errors: processInfo.errors.join(''),
      exitCode: processInfo.exitCode,
      duration: processInfo.duration
    };
  }

  // Obtener lista de procesos en ejecución
  getRunningProcesses() {
    return Array.from(this.runningProcesses.entries()).map(([id, info]) => ({
      id,
      command: info.command,
      startTime: info.startTime,
      running: !info.endTime,
      duration: info.duration || (Date.now() - info.startTime)
    }));
  }

  // Métodos privados
  async _executeCommand(command, options = {}) {
    const { timeout = this.config.timeout, cwd = process.cwd() } = options;
    
    try {
      const result = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        windowsHide: true
      });
      
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        success: true
      };
    } catch (error) {
      throw new AppError(
        ErrorCodes.COMMAND_EXECUTION_FAILED,
        error.message,
        { command, code: error.code, signal: error.signal }
      );
    }
  }

  _isCriticalCommand(command) {
    return this.config.criticalCommands.some(critical => 
      command.toLowerCase().includes(critical.toLowerCase())
    );
  }

  async _cleanupBeforeRetry(command, error) {
    // Limpiar caché de npm si es un comando npm
    if (command.includes('npm')) {
      try {
        await this._executeCommand('npm cache clean --force');
        logger.info('Cleaned npm cache before retry');
      } catch (e) {
        logger.warn('Failed to clean npm cache:', e.message);
      }
    }

    // Limpiar node_modules parciales si la instalación falló
    if (command.includes('npm install') && error.message.includes('ENOENT')) {
      try {
        await this.platformStrategy.cleanDirectory('./node_modules');
        logger.info('Cleaned node_modules before retry');
      } catch (e) {
        logger.warn('Failed to clean node_modules:', e.message);
      }
    }
  }

  _parseCommand(command) {
    // Simple parser, considera mejorar con shell-quote para casos complejos
    return command.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => 
      arg.replace(/^"|"$/g, '')
    );
  }

  _generateProcessId() {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _recordCommand(command, status, attempts) {
    this.commandHistory.push({
      command,
      status,
      attempts,
      timestamp: new Date().toISOString()
    });

    // Mantener solo los últimos 100 comandos
    if (this.commandHistory.length > 100) {
      this.commandHistory.shift();
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obtener estadísticas de comandos
  getStatistics() {
    const stats = {
      total: this.commandHistory.length,
      successful: 0,
      failed: 0,
      withRetries: 0,
      averageAttempts: 0
    };

    let totalAttempts = 0;

    this.commandHistory.forEach(record => {
      if (record.status === 'success') {
        stats.successful++;
        if (record.attempts > 0) {
          stats.withRetries++;
        }
      } else {
        stats.failed++;
      }
      totalAttempts += record.attempts + 1;
    });

    if (stats.total > 0) {
      stats.averageAttempts = (totalAttempts / stats.total).toFixed(2);
    }

    return stats;
  }
}

// Singleton para uso global
let executorInstance = null;

export function getCommandExecutor(config) {
  if (!executorInstance) {
    executorInstance = new CommandExecutor(config);
  }
  return executorInstance;
}

export default CommandExecutor;