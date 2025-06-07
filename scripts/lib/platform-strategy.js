// Platform Strategy Pattern - Manejo específico por sistema operativo

import os from 'os';
import { execSync } from 'child_process';

// Interfaz base para estrategias de plataforma
class PlatformStrategy {
  constructor() {
    this.platform = os.platform();
  }

  // Método para verificar disponibilidad de puerto
  isPortAvailable(port) {
    throw new Error('Method must be implemented by subclass');
  }

  // Método para limpiar directorios
  cleanDirectory(path) {
    throw new Error('Method must be implemented by subclass');
  }

  // Método para obtener información del sistema
  getSystemInfo() {
    return {
      platform: this.platform,
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
      node: process.version
    };
  }

  // Método para ejecutar comandos con configuración específica
  executeCommand(command, options = {}) {
    throw new Error('Method must be implemented by subclass');
  }
}

// Estrategia para Windows
class WindowsStrategy extends PlatformStrategy {
  isPortAvailable(port) {
    try {
      const result = execSync(`netstat -an | findstr :${port}`, { encoding: 'utf8' });
      return !result.includes('LISTENING');
    } catch (error) {
      // Si no encuentra nada, el puerto está disponible
      return true;
    }
  }

  cleanDirectory(path) {
    try {
      execSync(`if exist "${path}" rmdir /s /q "${path}"`, { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  executeCommand(command, options = {}) {
    const defaultOptions = {
      encoding: 'utf8',
      shell: 'powershell.exe',
      windowsHide: true
    };
    
    return execSync(command, { ...defaultOptions, ...options });
  }
}

// Estrategia para Unix/Linux
class UnixStrategy extends PlatformStrategy {
  isPortAvailable(port) {
    try {
      const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
      return false; // Si lsof encuentra algo, el puerto está en uso
    } catch (error) {
      // Si lsof no encuentra nada, el puerto está disponible
      return true;
    }
  }

  cleanDirectory(path) {
    try {
      execSync(`rm -rf "${path}"`, { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  executeCommand(command, options = {}) {
    const defaultOptions = {
      encoding: 'utf8',
      shell: '/bin/bash'
    };
    
    return execSync(command, { ...defaultOptions, ...options });
  }
}

// Estrategia para macOS
class MacOSStrategy extends UnixStrategy {
  isPortAvailable(port) {
    try {
      const result = execSync(`netstat -an | grep :${port}`, { encoding: 'utf8' });
      return !result.includes('LISTEN');
    } catch (error) {
      return true;
    }
  }

  getSystemInfo() {
    const baseInfo = super.getSystemInfo();
    try {
      const swVers = execSync('sw_vers', { encoding: 'utf8' });
      const version = swVers.match(/ProductVersion:\s*(.+)/)?.[1];
      return { ...baseInfo, osVersion: version || 'Unknown' };
    } catch {
      return baseInfo;
    }
  }
}

// Factory para obtener la estrategia correcta
export function getPlatformStrategy() {
  const platform = os.platform();
  
  switch (platform) {
    case 'win32':
      return new WindowsStrategy();
    case 'darwin':
      return new MacOSStrategy();
    case 'linux':
    case 'freebsd':
    case 'openbsd':
      return new UnixStrategy();
    default:
      // Fallback a Unix para plataformas desconocidas
      return new UnixStrategy();
  }
}

// Singleton para reutilizar la misma instancia
let strategyInstance = null;

export function getCurrentPlatformStrategy() {
  if (!strategyInstance) {
    strategyInstance = getPlatformStrategy();
  }
  return strategyInstance;
}

export { PlatformStrategy, WindowsStrategy, UnixStrategy, MacOSStrategy };