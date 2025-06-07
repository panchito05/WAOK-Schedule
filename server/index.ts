import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkDatabaseHealth } from "./db";
import os from "os";
import process from "process";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ARCHITECT-AI: Sistema de monitoreo y métricas avanzadas
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();
const performanceMetrics = {
  totalRequests: 0,
  totalErrors: 0,
  averageResponseTime: 0,
  peakMemoryUsage: 0,
  uptime: 0
};

// ARCHITECT-AI: Health check automático cada 30 segundos
setInterval(() => {
  const memUsage = process.memoryUsage();
  performanceMetrics.peakMemoryUsage = Math.max(performanceMetrics.peakMemoryUsage, memUsage.heapUsed);
  performanceMetrics.uptime = Date.now() - startTime;
  
  // Auto-diagnóstico de memoria crítica
  if (memUsage.heapUsed > 500 * 1024 * 1024) { // > 500MB
    log(`⚠️  ARCHITECT-AI ALERT: High memory usage detected: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
}, 30000);

// ARCHITECT-AI: Middleware avanzado de monitoreo y observabilidad
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  
  requestCount++;
  performanceMetrics.totalRequests++;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // ARCHITECT-AI: Actualizar métricas de rendimiento
    performanceMetrics.averageResponseTime = 
      (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + duration) / performanceMetrics.totalRequests;
    
    // ARCHITECT-AI: Detección de errores y alertas automáticas
    if (res.statusCode >= 400) {
      errorCount++;
      performanceMetrics.totalErrors++;
      log(`🚨 ARCHITECT-AI ERROR: ${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
    
    // ARCHITECT-AI: Detección de respuestas lentas
    if (duration > 1000) {
      log(`⚠️  ARCHITECT-AI SLOW RESPONSE: ${req.method} ${path} took ${duration}ms`);
    }
    
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ARCHITECT-AI: Endpoint de métricas y diagnóstico avanzado
app.get('/api/system/metrics', async (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const dbHealth = await checkDatabaseHealth();
  
  const systemInfo = {
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
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
      totalmem: Math.round(os.totalmem() / 1024 / 1024),
      loadavg: os.loadavg()
    },
    database: dbHealth,
    performance: performanceMetrics,
    requests: {
      total: requestCount,
      errors: errorCount,
      errorRate: requestCount > 0 ? (errorCount / requestCount * 100).toFixed(2) + '%' : '0%'
    }
  };
  res.json(systemInfo);
});

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
