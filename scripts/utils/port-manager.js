/**
 * WAOK-Schedule Port Manager
 * Sistema robusto y multiplataforma para gestión de puertos
 * Incluye verificación, retry automático y liberación de puertos
 */

const net = require('net');
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

// Configuración de puertos por defecto
const DEFAULT_PORTS = {
  backend: 5000,
  frontend: 5173,
  websocket: 5001,
  database: 5432
};

// Configuración de reintentos
const RETRY_CONFIG = {
  maxAttempts: 5,
  delayMs: 1000,
  backoffFactor: 1.5
};

class PortManager {
  constructor() {
    this.platform = os.platform();
    this.usedPorts = new Set();
    this.portLocks = new Map();
  }

  /**
   * Verifica si un puerto está disponible
   * @param {number} port - Puerto a verificar
   * @returns {Promise<boolean>} - true si está disponible
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          // Otros errores también indican no disponible
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close(() => {
          resolve(true);
        });
      });
      
      server.listen(port);
    });
  }

  /**
   * Encuentra un puerto disponible comenzando desde el especificado
   * @param {number} startPort - Puerto inicial
   * @param {number} maxPort - Puerto máximo a intentar
   * @returns {Promise<number>} - Puerto disponible encontrado
   */
  async findAvailablePort(startPort = 3000, maxPort = 65535) {
    for (let port = startPort; port <= maxPort; port++) {
      if (!this.usedPorts.has(port) && await this.isPortAvailable(port)) {
        this.usedPorts.add(port);
        return port;
      }
    }
    throw new Error(`No se encontró puerto disponible entre ${startPort} y ${maxPort}`);
  }

  /**
   * Obtiene el proceso que está usando un puerto específico
   * @param {number} port - Puerto a verificar
   * @returns {Promise<Object|null>} - Información del proceso o null
   */
  async getProcessUsingPort(port) {
    try {
      let command;
      let parseOutput;

      switch (this.platform) {
        case 'win32':
          command = `netstat -ano -p tcp | findstr :${port}`;
          parseOutput = (output) => {
            const lines = output.trim().split('\n');
            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 5 && line.includes(`:${port}`)) {
                const pid = parts[parts.length - 1];
                return { pid: parseInt(pid), platform: 'windows' };
              }
            }
            return null;
          };
          break;

        case 'darwin':
        case 'linux':
          command = `lsof -i :${port} -t`;
          parseOutput = (output) => {
            const pid = output.trim();
            if (pid) {
              return { pid: parseInt(pid), platform: this.platform };
            }
            return null;
          };
          break;

        default:
          throw new Error(`Plataforma no soportada: ${this.platform}`);
      }

      const { stdout } = await execAsync(command);
      return parseOutput(stdout);
    } catch (error) {
      // Si el comando falla, probablemente el puerto está libre
      return null;
    }
  }

  /**
   * Intenta liberar un puerto matando el proceso que lo usa
   * @param {number} port - Puerto a liberar
   * @param {boolean} force - Si forzar el cierre del proceso
   * @returns {Promise<boolean>} - true si se liberó exitosamente
   */
  async killProcessOnPort(port, force = false) {
    const process = await this.getProcessUsingPort(port);
    
    if (!process) {
      return true; // Puerto ya está libre
    }

    try {
      let command;
      
      switch (this.platform) {
        case 'win32':
          command = `taskkill ${force ? '/F' : ''} /PID ${process.pid}`;
          break;
        case 'darwin':
        case 'linux':
          command = `kill ${force ? '-9' : ''} ${process.pid}`;
          break;
        default:
          throw new Error(`Plataforma no soportada: ${this.platform}`);
      }

      await execAsync(command);
      
      // Esperar un momento para que el puerto se libere
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar que el puerto esté libre
      return await this.isPortAvailable(port);
    } catch (error) {
      console.error(`Error liberando puerto ${port}: ${error.message}`);
      return false;
    }
  }

  /**
   * Reserva un puerto con reintentos automáticos
   * @param {string} serviceName - Nombre del servicio
   * @param {number} preferredPort - Puerto preferido
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<number>} - Puerto reservado
   */
  async reservePort(serviceName, preferredPort, options = {}) {
    const {
      autoKill = false,
      maxRetries = RETRY_CONFIG.maxAttempts,
      retryDelay = RETRY_CONFIG.delayMs
    } = options;

    let attempts = 0;
    let currentDelay = retryDelay;

    while (attempts < maxRetries) {
      attempts++;
      
      // Verificar si el puerto está disponible
      if (await this.isPortAvailable(preferredPort)) {
        this.usedPorts.add(preferredPort);
        this.portLocks.set(serviceName, preferredPort);
        return preferredPort;
      }

      // Si autoKill está habilitado, intentar liberar el puerto
      if (autoKill && attempts === 1) {
        console.log(`Puerto ${preferredPort} ocupado. Intentando liberar...`);
        const killed = await this.killProcessOnPort(preferredPort, attempts > 2);
        
        if (killed) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }

      // Si no es el último intento, esperar antes de reintentar
      if (attempts < maxRetries) {
        console.log(`Reintento ${attempts}/${maxRetries} en ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= RETRY_CONFIG.backoffFactor;
      }
    }

    // Si todos los intentos fallaron, buscar un puerto alternativo
    console.log(`No se pudo obtener puerto ${preferredPort}. Buscando alternativa...`);
    const alternativePort = await this.findAvailablePort(preferredPort + 1);
    this.portLocks.set(serviceName, alternativePort);
    
    return alternativePort;
  }

  /**
   * Libera un puerto reservado
   * @param {string} serviceName - Nombre del servicio
   */
  releasePort(serviceName) {
    const port = this.portLocks.get(serviceName);
    if (port) {
      this.usedPorts.delete(port);
      this.portLocks.delete(serviceName);
    }
  }

  /**
   * Obtiene información de diagnóstico de puertos
   * @returns {Object} - Información de diagnóstico
   */
  getDiagnostics() {
    return {
      platform: this.platform,
      usedPorts: Array.from(this.usedPorts),
      reservedPorts: Object.fromEntries(this.portLocks),
      defaultPorts: DEFAULT_PORTS
    };
  }

  /**
   * Verifica la salud de todos los puertos configurados
   * @returns {Promise<Object>} - Estado de salud de los puertos
   */
  async checkPortHealth() {
    const health = {
      healthy: true,
      services: {}
    };

    for (const [service, defaultPort] of Object.entries(DEFAULT_PORTS)) {
      const isAvailable = await this.isPortAvailable(defaultPort);
      const process = !isAvailable ? await this.getProcessUsingPort(defaultPort) : null;
      
      health.services[service] = {
        port: defaultPort,
        available: isAvailable,
        process: process,
        status: isAvailable ? 'ready' : 'occupied'
      };

      if (!isAvailable && (service === 'backend' || service === 'frontend')) {
        health.healthy = false;
      }
    }

    return health;
  }
}

// Singleton instance
const portManager = new PortManager();

module.exports = {
  portManager,
  PortManager,
  DEFAULT_PORTS,
  RETRY_CONFIG
};