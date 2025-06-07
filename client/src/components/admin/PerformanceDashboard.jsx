import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CpuIcon, 
  Database, 
  Globe, 
  Lock, 
  MemoryStick, 
  RefreshCw, 
  Shield, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    performance: {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0,
      activeUsers: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      dbConnections: 0
    },
    security: {
      blockedRequests: 0,
      suspiciousActivity: 0,
      lastSecurityScan: null,
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      authFailures: 0,
      rateLimitHits: 0
    },
    lighthouse: {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      pwa: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simular datos en tiempo real
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // En producción, esto sería una llamada real a la API
        const mockData = {
          performance: {
            responseTime: Math.random() * 200 + 50,
            throughput: Math.random() * 1000 + 500,
            errorRate: Math.random() * 5,
            uptime: 99.9,
            activeUsers: Math.floor(Math.random() * 100) + 10,
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            dbConnections: Math.floor(Math.random() * 20) + 5
          },
          security: {
            blockedRequests: Math.floor(Math.random() * 50),
            suspiciousActivity: Math.floor(Math.random() * 10),
            lastSecurityScan: new Date(Date.now() - Math.random() * 3600000),
            vulnerabilities: {
              critical: Math.floor(Math.random() * 3),
              high: Math.floor(Math.random() * 5),
              medium: Math.floor(Math.random() * 10),
              low: Math.floor(Math.random() * 15)
            },
            authFailures: Math.floor(Math.random() * 20),
            rateLimitHits: Math.floor(Math.random() * 100)
          },
          lighthouse: {
            performance: Math.random() * 30 + 70,
            accessibility: Math.random() * 20 + 80,
            bestPractices: Math.random() * 25 + 75,
            seo: Math.random() * 20 + 80,
            pwa: Math.random() * 30 + 70
          }
        };
        
        setMetrics(mockData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'destructive';
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando métricas...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Rendimiento</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del sistema WAOK-Schedule
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última actualización: {formatTime(lastUpdate)}</span>
        </div>
      </div>

      {/* Alertas críticas */}
      {(metrics.security.vulnerabilities.critical > 0 || metrics.performance.errorRate > 5) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención Requerida</AlertTitle>
          <AlertDescription>
            {metrics.security.vulnerabilities.critical > 0 && 
              `${metrics.security.vulnerabilities.critical} vulnerabilidades críticas detectadas. `}
            {metrics.performance.errorRate > 5 && 
              `Tasa de error elevada: ${metrics.performance.errorRate.toFixed(2)}%. `}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="lighthouse">
            <Globe className="h-4 w-4 mr-2" />
            Web Vitals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.responseTime.toFixed(0)}ms</div>
                <p className="text-xs text-muted-foreground">Promedio últimos 5 min</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Conectados ahora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.uptime}%</div>
                <p className="text-xs text-muted-foreground">Últimos 30 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.performance.errorRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Última hora</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CpuIcon className="h-5 w-5 mr-2" />
                  Uso de CPU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU</span>
                    <span>{metrics.performance.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.performance.cpuUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MemoryStick className="h-5 w-5 mr-2" />
                  Uso de Memoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>RAM</span>
                    <span>{metrics.performance.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.performance.memoryUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requests Bloqueados</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.security.blockedRequests}</div>
                <p className="text-xs text-muted-foreground">Última hora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actividad Sospechosa</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.security.suspiciousActivity}</div>
                <p className="text-xs text-muted-foreground">Alertas activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fallos de Auth</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.security.authFailures}</div>
                <p className="text-xs text-muted-foreground">Últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.security.rateLimitHits}</div>
                <p className="text-xs text-muted-foreground">Hits bloqueados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vulnerabilidades Detectadas</CardTitle>
              <CardDescription>
                Último escaneo: {metrics.security.lastSecurityScan?.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium text-red-600">Críticas</p>
                    <p className="text-2xl font-bold">{metrics.security.vulnerabilities.critical}</p>
                  </div>
                  <Badge variant="destructive">{metrics.security.vulnerabilities.critical}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Altas</p>
                    <p className="text-2xl font-bold">{metrics.security.vulnerabilities.high}</p>
                  </div>
                  <Badge variant="destructive">{metrics.security.vulnerabilities.high}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Medias</p>
                    <p className="text-2xl font-bold">{metrics.security.vulnerabilities.medium}</p>
                  </div>
                  <Badge variant="warning">{metrics.security.vulnerabilities.medium}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Bajas</p>
                    <p className="text-2xl font-bold">{metrics.security.vulnerabilities.low}</p>
                  </div>
                  <Badge variant="secondary">{metrics.security.vulnerabilities.low}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lighthouse" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.lighthouse.performance)}`}>
                  {metrics.lighthouse.performance.toFixed(0)}
                </div>
                <Badge variant={getScoreBadge(metrics.lighthouse.performance)} className="mt-2">
                  {metrics.lighthouse.performance >= 90 ? 'Excelente' : 
                   metrics.lighthouse.performance >= 75 ? 'Bueno' : 'Mejorar'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accesibilidad</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.lighthouse.accessibility)}`}>
                  {metrics.lighthouse.accessibility.toFixed(0)}
                </div>
                <Badge variant={getScoreBadge(metrics.lighthouse.accessibility)} className="mt-2">
                  {metrics.lighthouse.accessibility >= 90 ? 'Excelente' : 
                   metrics.lighthouse.accessibility >= 75 ? 'Bueno' : 'Mejorar'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mejores Prácticas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.lighthouse.bestPractices)}`}>
                  {metrics.lighthouse.bestPractices.toFixed(0)}
                </div>
                <Badge variant={getScoreBadge(metrics.lighthouse.bestPractices)} className="mt-2">
                  {metrics.lighthouse.bestPractices >= 90 ? 'Excelente' : 
                   metrics.lighthouse.bestPractices >= 75 ? 'Bueno' : 'Mejorar'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SEO</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.lighthouse.seo)}`}>
                  {metrics.lighthouse.seo.toFixed(0)}
                </div>
                <Badge variant={getScoreBadge(metrics.lighthouse.seo)} className="mt-2">
                  {metrics.lighthouse.seo >= 90 ? 'Excelente' : 
                   metrics.lighthouse.seo >= 75 ? 'Bueno' : 'Mejorar'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PWA</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(metrics.lighthouse.pwa)}`}>
                  {metrics.lighthouse.pwa.toFixed(0)}
                </div>
                <Badge variant={getScoreBadge(metrics.lighthouse.pwa)} className="mt-2">
                  {metrics.lighthouse.pwa >= 90 ? 'Excelente' : 
                   metrics.lighthouse.pwa >= 75 ? 'Bueno' : 'Mejorar'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado de Web Vitals</CardTitle>
              <CardDescription>
                Métricas de rendimiento web según estándares de Google Lighthouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Performance</span>
                    <span className={getScoreColor(metrics.lighthouse.performance)}>
                      {metrics.lighthouse.performance.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={metrics.lighthouse.performance} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Accesibilidad</span>
                    <span className={getScoreColor(metrics.lighthouse.accessibility)}>
                      {metrics.lighthouse.accessibility.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={metrics.lighthouse.accessibility} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Mejores Prácticas</span>
                    <span className={getScoreColor(metrics.lighthouse.bestPractices)}>
                      {metrics.lighthouse.bestPractices.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={metrics.lighthouse.bestPractices} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>SEO</span>
                    <span className={getScoreColor(metrics.lighthouse.seo)}>
                      {metrics.lighthouse.seo.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={metrics.lighthouse.seo} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>PWA</span>
                    <span className={getScoreColor(metrics.lighthouse.pwa)}>
                      {metrics.lighthouse.pwa.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={metrics.lighthouse.pwa} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recomendaciones automáticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recomendaciones del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.performance.responseTime > 200 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tiempo de respuesta elevado. Considere optimizar consultas de base de datos.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.performance.cpuUsage > 80 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Uso de CPU alto. Evalúe la necesidad de escalado horizontal.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.lighthouse.performance < 75 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Puntuación de rendimiento web baja. Optimice recursos estáticos y código JavaScript.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.security.vulnerabilities.critical > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Vulnerabilidades críticas detectadas. Actualice dependencias inmediatamente.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Mensaje de estado saludable */}
            {metrics.performance.responseTime <= 200 && 
             metrics.performance.cpuUsage <= 80 && 
             metrics.lighthouse.performance >= 75 && 
             metrics.security.vulnerabilities.critical === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Todos los sistemas funcionan correctamente. Rendimiento óptimo.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;