// Patrón Strategy para operaciones específicas del SO
const { spawn } = require('child_process');
const net = require('net');
const os = require('os');

// Clase base para estrategias de SO
class OSStrategy {
  constructor(config) {
    this.config = config;
    this.platform = os.platform();
  }
  
  // Métodos abstractos que deben implementar las subclases
  async checkPort(port) {
    throw new Error('checkPort debe ser implementado');
  }
  
  async killProcess(pid) {
    throw new Error('killProcess debe ser implementado');
  }
  
  async executeCommand(command, args = [], options = {}) {
    throw new Error('executeCommand debe ser implementado');
  }
  
  getShell() {
    throw new Error('getShell debe ser implementado');
  }
  
  // Métodos comunes
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port);
    });
  }
  
  // Ejecutor de comandos con retry
  async executeWithRetry(command, args = [], options = {}) {
    const { maxAttempts, delayMs, backoffMultiplier } = this.config.get('commands.retry');
    let lastError;
    let delay = delayMs;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.executeCommand(command, args, {
          ...options,
          attempt
        });
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts) {
          await this.delay(delay);
          delay *= backoffMultiplier;
        }
      }
    }
    
    throw new Error(`Comando falló después de ${maxAttempts} intentos: ${lastError.message}`);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Estrategia para Windows
class WindowsStrategy extends OSStrategy {
  getShell() {
    return {
      command: 'powershell.exe',
      args: ['-NoProfile', '-Command']
    };
  }
  
  async checkPort(port) {
    return new Promise((resolve, reject) => {
      const command = `netstat -ano | Select-String -Pattern :${port}`;
      const { command: shell, args: shellArgs } = this.getShell();
      
      const process = spawn(shell, [...shellArgs, command]);
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0 && output.includes(`:${port}`)) {
          // Extraer PID del output
          const lines = output.split('\n');
          const pidMatch = lines[0]?.match(/\s+(\d+)\s*$/); 
          const pid = pidMatch ? pidMatch[1] : null;
          resolve({ inUse: true, pid });
        } else {
          resolve({ inUse: false, pid: null });
        }
      });
      
      process.on('error', reject);
    });
  }
  
  async killProcess(pid) {
    return new Promise((resolve, reject) => {
      const { command: shell, args: shellArgs } = this.getShell();
      const command = `taskkill /F /PID ${pid}`;
      
      const process = spawn(shell, [...shellArgs, command]);
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`No se pudo terminar el proceso ${pid}`));
        }
      });
      
      process.on('error', reject);
    });
  }
  
  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const { timeout = 30000 } = options;
      const { command: shell, args: shellArgs } = this.getShell();
      
      // Construir comando completo
      const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
      
      const process = spawn(shell, [...shellArgs, fullCommand], {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        ...options.spawnOptions
      });
      
      let output = '';
      let error = '';
      let timedOut = false;
      
      // Configurar timeout
      const timer = setTimeout(() => {
        timedOut = true;
        process.kill('SIGTERM');
      }, timeout);
      
      process.stdout.on('data', (data) => {
        output += data.toString();
        if (options.onData) options.onData(data.toString());
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
        if (options.onError) options.onError(data.toString());
      });
      
      process.on('close', (code) => {
        clearTimeout(timer);
        
        if (timedOut) {
          reject(new Error(`Comando expiró después de ${timeout}ms`));
        } else if (code !== 0) {
          reject(new Error(`Comando falló con código ${code}: ${error}`));
        } else {
          resolve({ output, error, code });
        }
      });
      
      process.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}

// Estrategia para Unix (Linux/Mac)
class UnixStrategy extends OSStrategy {
  getShell() {
    return {
      command: '/bin/bash',
      args: ['-c']
    };
  }
  
  async checkPort(port) {
    return new Promise((resolve, reject) => {
      const command = `lsof -i :${port} -t`;
      const { command: shell, args: shellArgs } = this.getShell();
      
      const process = spawn(shell, [...shellArgs, command]);
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0 && output) {
          const pid = output.trim().split('\n')[0];
          resolve({ inUse: true, pid });
        } else {
          resolve({ inUse: false, pid: null });
        }
      });
      
      process.on('error', reject);
    });
  }
  
  async killProcess(pid) {
    return new Promise((resolve, reject) => {
      const { command: shell, args: shellArgs } = this.getShell();
      const command = `kill -9 ${pid}`;
      
      const process = spawn(shell, [...shellArgs, command]);
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`No se pudo terminar el proceso ${pid}`));
        }
      });
      
      process.on('error', reject);
    });
  }
  
  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const { timeout = 30000 } = options;
      const { command: shell, args: shellArgs } = this.getShell();
      
      // Construir comando completo
      const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
      
      const process = spawn(shell, [...shellArgs, fullCommand], {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        ...options.spawnOptions
      });
      
      let output = '';
      let error = '';
      let timedOut = false;
      
      // Configurar timeout
      const timer = setTimeout(() => {
        timedOut = true;
        process.kill('SIGTERM');
      }, timeout);
      
      process.stdout.on('data', (data) => {
        output += data.toString();
        if (options.onData) options.onData(data.toString());
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
        if (options.onError) options.onError(data.toString());
      });
      
      process.on('close', (code) => {
        clearTimeout(timer);
        
        if (timedOut) {
          reject(new Error(`Comando expiró después de ${timeout}ms`));
        } else if (code !== 0) {
          reject(new Error(`Comando falló con código ${code}: ${error}`));
        } else {
          resolve({ output, error, code });
        }
      });
      
      process.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}

// Factory para crear la estrategia correcta
class OSStrategyFactory {
  static create(config) {
    const platform = os.platform();
    
    switch (platform) {
      case 'win32':
        return new WindowsStrategy(config);
      case 'darwin':
      case 'linux':
        return new UnixStrategy(config);
      default:
        throw new Error(`Plataforma no soportada: ${platform}`);
    }
  }
}

module.exports = {
  OSStrategy,
  WindowsStrategy,
  UnixStrategy,
  OSStrategyFactory
};