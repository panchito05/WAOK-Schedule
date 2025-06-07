/**
 * WAOK-Schedule Error Handler
 * Sistema centralizado de manejo de errores con códigos específicos,
 * rollback automático y recuperación inteligente
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Códigos de error específicos del sistema
const ERROR_CODES = {
  // Errores de sistema (1000-1999)
  SYSTEM_INIT_FAILED: { code: 1001, severity: 'critical', message: 'Fallo en inicialización del sistema' },
  SYSTEM_SHUTDOWN_ERROR: { code: 1002, severity: 'high', message: 'Error durante el apagado del sistema' },
  SYSTEM_CONFIG_INVALID: { code: 1003, severity: 'critical', message: 'Configuración del sistema inválida' },
  
  // Errores de puerto (2000-2999)
  PORT_UNAVAILABLE: { code: 2001, severity: 'high', message: 'Puerto no disponible' },
  PORT_BIND_FAILED: { code: 2002, severity: 'high', message: 'Fallo al enlazar puerto' },
  PORT_KILL_FAILED: { code: 2003, severity: 'medium', message: 'No se pudo liberar el puerto' },
  
  // Errores de proceso (3000-3999)
  PROCESS_START_FAILED: { code: 3001, severity: 'high', message: 'Fallo al iniciar proceso' },
  PROCESS_CRASH: { code: 3002, severity: 'critical', message: 'Proceso terminado inesperadamente' },
  PROCESS_TIMEOUT: { code: 3003, severity: 'medium', message: 'Timeout en proceso' },
  
  // Errores de comandos (4000-4999)
  COMMAND_NOT_FOUND: { code: 4001, severity: 'high', message: 'Comando no encontrado' },
  COMMAND_EXECUTION_FAILED: { code: 4002, severity: 'medium', message: 'Fallo en ejecución de comando' },
  COMMAND_PERMISSION_DENIED: { code: 4003, severity: 'high', message: 'Permisos insuficientes' },
  
  // Errores de red (5000-5999)
  NETWORK_UNAVAILABLE: { code: 5001, severity: 'high', message: 'Red no disponible' },
  API_REQUEST_FAILED: { code: 5002, severity: 'medium', message: 'Fallo en petición API' },
  WEBSOCKET_CONNECTION_LOST: { code: 5003, severity: 'medium', message: 'Conexión WebSocket perdida' },
  
  // Errores de datos (6000-6999)
  DATABASE_CONNECTION_FAILED: { code: 6001, severity: 'critical', message: 'Fallo en conexión a base de datos' },
  DATA_VALIDATION_FAILED: { code: 6002, severity: 'low', message: 'Validación de datos fallida' },
  DATA_CORRUPTION: { code: 6003, severity: 'critical', message: 'Corrupción de datos detectada' }
};

// Severidades de error
const SEVERITY_LEVELS = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

// Estrategias de recuperación
const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  ROLLBACK: 'rollback',
  RESTART: 'restart',
  IGNORE: 'ignore',
  ESCALATE: 'escalate'
};

class WAOKError extends Error {
  constructor(errorCode, details = {}) {
    const errorInfo = ERROR_CODES[errorCode] || { code: 9999, severity: 'unknown', message: 'Error desconocido' };
    super(errorInfo.message);
    
    this.name = 'WAOKError';
    this.code = errorInfo.code;
    this.errorCode = errorCode;
    this.severity = errorInfo.severity;
    this.details = details;
    this.timestamp = new Date();
    this.stack = (new Error()).stack;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      errorCode: this.errorCode,
      severity: this.severity,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

class ErrorHandler extends EventEmitter {
  constructor() {
    super();
    this.errors = [];
    this.rollbackStack = [];
    this.recoveryAttempts = new Map();
    this.errorLog = [];
    this.maxErrorLogSize = 1000;
    this.setupGlobalHandlers();
  }

  /**
   * Configura manejadores globales de errores
   */
  setupGlobalHandlers() {
    // Manejar promesas rechazadas no capturadas
    process.on('unhandledRejection', (reason, promise) => {
      this.handleError(new WAOKError('SYSTEM_INIT_FAILED', {
        type: 'unhandledRejection',
        reason: reason?.toString(),
        promise: promise
      }));
    });

    // Manejar excepciones no capturadas
    process.on('uncaughtException', (error) => {
      this.handleError(new WAOKError('SYSTEM_INIT_FAILED', {
        type: 'uncaughtException',
        error: error.message,
        stack: error.stack
      }));
      
      // En caso de excepción no capturada, intentar guardar el estado
      this.emergencyDump().then(() => {
        process.exit(1);
      });
    });
  }

  /**
   * Maneja un error según su severidad y tipo
   * @param {Error|WAOKError} error - Error a manejar
   * @param {Object} context - Contexto del error
   * @returns {Promise<Object>} - Resultado del manejo
   */
  async handleError(error, context = {}) {
    // Convertir a WAOKError si es necesario
    if (!(error instanceof WAOKError)) {
      error = new WAOKError('SYSTEM_INIT_FAILED', {
        originalError: error.message,
        originalStack: error.stack
      });
    }

    // Registrar el error
    this.logError(error, context);

    // Emitir evento de error
    this.emit('error', error, context);

    // Determinar estrategia de recuperación
    const strategy = this.determineRecoveryStrategy(error, context);

    // Ejecutar estrategia de recuperación
    const result = await this.executeRecoveryStrategy(strategy, error, context);

    return {
      error: error.toJSON(),
      strategy,
      result,
      recovered: result.success
    };
  }

  /**
   * Determina la estrategia de recuperación basada en el error
   * @param {WAOKError} error - Error a analizar
   * @param {Object} context - Contexto del error
   * @returns {string} - Estrategia a aplicar
   */
  determineRecoveryStrategy(error, context) {
    // Contar intentos de recuperación para este tipo de error
    const attemptKey = `${error.errorCode}_${JSON.stringify(context)}`;
    const attempts = this.recoveryAttempts.get(attemptKey) || 0;
    
    // Si ya se intentó muchas veces, escalar
    if (attempts > 3) {
      return RECOVERY_STRATEGIES.ESCALATE;
    }

    // Estrategias según severidad y tipo
    switch (error.severity) {
      case 'critical':
        if (this.rollbackStack.length > 0) {
          return RECOVERY_STRATEGIES.ROLLBACK;
        }
        return RECOVERY_STRATEGIES.RESTART;
        
      case 'high':
        if (error.errorCode.startsWith('PORT_')) {
          return RECOVERY_STRATEGIES.RETRY;
        }
        return RECOVERY_STRATEGIES.ROLLBACK;
        
      case 'medium':
        return RECOVERY_STRATEGIES.RETRY;
        
      case 'low':
        return RECOVERY_STRATEGIES.IGNORE;
        
      default:
        return RECOVERY_STRATEGIES.ESCALATE;
    }
  }

  /**
   * Ejecuta la estrategia de recuperación seleccionada
   * @param {string} strategy - Estrategia a ejecutar
   * @param {WAOKError} error - Error original
   * @param {Object} context - Contexto del error
   * @returns {Promise<Object>} - Resultado de la recuperación
   */
  async executeRecoveryStrategy(strategy, error, context) {
    const attemptKey = `${error.errorCode}_${JSON.stringify(context)}`;
    const attempts = this.recoveryAttempts.get(attemptKey) || 0;
    this.recoveryAttempts.set(attemptKey, attempts + 1);

    try {
      switch (strategy) {
        case RECOVERY_STRATEGIES.RETRY:
          return await this.retryOperation(context);
          
        case RECOVERY_STRATEGIES.ROLLBACK:
          return await this.executeRollback();
          
        case RECOVERY_STRATEGIES.RESTART:
          return await this.restartService(context);
          
        case RECOVERY_STRATEGIES.IGNORE:
          return { success: true, action: 'ignored' };
          
        case RECOVERY_STRATEGIES.ESCALATE:
          return await this.escalateError(error, context);
          
        default:
          return { success: false, action: 'unknown_strategy' };
      }
    } catch (recoveryError) {
      // Si la recuperación falla, registrar y escalar
      this.logError(recoveryError, { originalError: error, strategy });
      return { success: false, action: 'recovery_failed', error: recoveryError.message };
    }
  }

  /**
   * Reintenta una operación fallida
   * @param {Object} context - Contexto de la operación
   * @returns {Promise<Object>} - Resultado del reintento
   */
  async retryOperation(context) {
    if (!context.retryFunction) {
      return { success: false, action: 'no_retry_function' };
    }

    const maxRetries = context.maxRetries || 3;
    const retryDelay = context.retryDelay || 1000;
    const currentAttempt = context.currentAttempt || 1;

    if (currentAttempt > maxRetries) {
      return { success: false, action: 'max_retries_exceeded' };
    }

    // Esperar antes de reintentar
    await new Promise(resolve => setTimeout(resolve, retryDelay * currentAttempt));

    try {
      const result = await context.retryFunction();
      return { success: true, action: 'retry_successful', result };
    } catch (retryError) {
      // Actualizar contexto para el siguiente intento
      context.currentAttempt = currentAttempt + 1;
      throw retryError;
    }
  }

  /**
   * Registra una acción para rollback
   * @param {Function} rollbackFunction - Función de rollback
   * @param {string} description - Descripción de la acción
   */
  registerRollback(rollbackFunction, description) {
    this.rollbackStack.push({
      function: rollbackFunction,
      description,
      timestamp: new Date()
    });
  }

  /**
   * Ejecuta todas las acciones de rollback en orden inverso
   * @returns {Promise<Object>} - Resultado del rollback
   */
  async executeRollback() {
    const results = [];
    const rollbackItems = [...this.rollbackStack].reverse();
    
    for (const item of rollbackItems) {
      try {
        console.log(`Ejecutando rollback: ${item.description}`);
        await item.function();
        results.push({ success: true, description: item.description });
      } catch (rollbackError) {
        results.push({ 
          success: false, 
          description: item.description, 
          error: rollbackError.message 
        });
      }
    }

    // Limpiar stack de rollback después de ejecutar
    this.rollbackStack = [];

    const allSuccessful = results.every(r => r.success);
    return {
      success: allSuccessful,
      action: 'rollback_executed',
      results
    };
  }

  /**
   * Reinicia un servicio específico
   * @param {Object} context - Contexto del servicio
   * @returns {Promise<Object>} - Resultado del reinicio
   */
  async restartService(context) {
    if (!context.serviceName) {
      return { success: false, action: 'no_service_specified' };
    }

    // Emitir evento de reinicio
    this.emit('service:restart', context.serviceName);

    return {
      success: true,
      action: 'restart_requested',
      service: context.serviceName
    };
  }

  /**
   * Escala un error crítico
   * @param {WAOKError} error - Error a escalar
   * @param {Object} context - Contexto del error
   * @returns {Promise<Object>} - Resultado de la escalación
   */
  async escalateError(error, context) {
    // Guardar información crítica
    await this.emergencyDump();

    // Emitir evento crítico
    this.emit('critical:error', error, context);

    // Notificar a sistemas externos si están configurados
    if (context.notificationHandler) {
      await context.notificationHandler(error, context);
    }

    return {
      success: true,
      action: 'error_escalated',
      severity: error.severity
    };
  }

  /**
   * Registra un error en el log
   * @param {