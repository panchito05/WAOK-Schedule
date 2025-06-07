// ARCHITECT-AI: Health Check System
// Sistema de monitoreo de salud automático para WAOK Schedule

import { type Request, Response } from 'express';
import os from 'os';
import process from 'process';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  system: {
    platform: string;
    arch: string;
    cpus: number;
    freemem: number;
    totalmem: number;
  };
  checks: {
    memory: boolean;
    uptime: boolean;
    disk: boolean;
  };
}

/**
 * ARCHITECT-AI: Función de diagnóstico avanzado
 * Evalúa el estado de salud del sistema automáticamente
 */
export function performHealthCheck(): HealthStatus {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime() * 1000;
  
  const memoryUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  // ARCHITECT-AI: Criterios de salud automáticos
  const checks = {
    memory: memoryPercentage < 85, // < 85% de uso de memoria
    uptime: uptime > 60000, // > 1 minuto de uptime
    disk: os.freemem() > 100 * 1024 * 1024 // > 100MB de RAM libre
  };
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  // ARCHITECT-AI: Lógica de estado automática
  if (!checks.memory || !checks.disk) {
    status = 'unhealthy';
  } else if (!checks.uptime) {
    status = 'degraded';
  }
  
  return {
    status,
    timestamp: new Date().toISOString(),
    uptime,
    memory: {
      used: memoryUsedMB,
      total: memoryTotalMB,
      percentage: Math.round(memoryPercentage * 100) / 100
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      freemem: Math.round(os.freemem() / 1024 / 1024),
      totalmem: Math.round(os.totalmem() / 1024 / 1024)
    },
    checks
  };
}

/**
 * ARCHITECT-AI: Handler del endpoint de health check
 * Responde con el estado de salud actual del sistema
 */
export function healthCheckHandler(req: Request, res: Response): void {
  try {
    const healthStatus = performHealthCheck();
    
    // ARCHITECT-AI: Código de estado HTTP automático basado en salud
    const httpStatus = {
      'healthy': 200,
      'degraded': 200,
      'unhealthy': 503
    }[healthStatus.status];
    
    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    // ARCHITECT-AI: Manejo de errores en health check
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        memory: false,
        uptime: false,
        disk: false
      }
    });
  }
}

/**
 * ARCHITECT-AI: Health check simplificado para balanceadores de carga
 * Responde solo con 200 OK si el sistema está operativo
 */
export function simpleHealthCheck(req: Request, res: Response): void {
  const healthStatus = performHealthCheck();
  
  if (healthStatus.status === 'unhealthy') {
    res.status(503).send('Service Unavailable');
  } else {
    res.status(200).send('OK');
  }
}