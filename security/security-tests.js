const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Suite de pruebas de seguridad para WAOK-Schedule
 * Incluye:
 * - Análisis de dependencias vulnerables
 * - Pruebas de endpoints de API
 * - Verificación de headers de seguridad
 * - Análisis de autenticación
 * - Detección de inyecciones SQL/XSS
 */

class SecurityTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      vulnerabilities: [],
      warnings: [],
      passed: [],
      timestamp: new Date().toISOString(),
    };
    this.reportPath = './security/reports';
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }
  }

  log(level, message, details = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    };
    
    console.log(`[${level.toUpperCase()}] ${message}`);
    
    if (level === 'VULNERABILITY') {
      this.results.vulnerabilities.push(logEntry);
    } else if (level === 'WARNING') {
      this.results.warnings.push(logEntry);
    } else if (level === 'PASS') {
      this.results.passed.push(logEntry);
    }
  }

  async runAllTests() {
    console.log('🔒 Iniciando suite de pruebas de seguridad WAOK-Schedule');
    console.log('=' .repeat(60));
    
    try {
      // Verificar que la app esté corriendo
      await this.checkAppAvailability();
      
      // Ejecutar todas las pruebas
      await this.testDependencyVulnerabilities();
      await this.testSecurityHeaders();
      await this.testAuthenticationSecurity();
      await this.testApiEndpointsSecurity();
      await this.testInputValidation();
      await this.testSessionManagement();
      await this.testDataExposure();
      
      // Generar reporte
      await this.generateReport();
      
    } catch (error) {
      this.log('ERROR', 'Error durante las pruebas de seguridad', error.message);
    }
  }

  async checkAppAvailability() {
    return new Promise((resolve, reject) => {
      const req = http.get(this.baseUrl, (res) => {
        if (res.statusCode === 200) {
          this.log('INFO', 'Aplicación disponible para pruebas de seguridad');
          resolve();
        } else {
          reject(new Error(`App no disponible: ${res.statusCode}`));
        }
      });
      
      req.on('error', (error) => {
        reject(new Error(`No se puede conectar a ${this.baseUrl}: ${error.message}`));
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout al conectar con la aplicación'));
      });
    });
  }

  async testDependencyVulnerabilities() {
    console.log('\n🔍 Analizando vulnerabilidades en dependencias...');
    
    try {
      // Ejecutar npm audit
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        const vulnCount = Object.keys(audit.vulnerabilities).length;
        const criticalCount = Object.values(audit.vulnerabilities)
          .filter(v => v.severity === 'critical').length;
        const highCount = Object.values(audit.vulnerabilities)
          .filter(v => v.severity === 'high').length;
        
        if (criticalCount > 0) {
          this.log('VULNERABILITY', `Encontradas ${criticalCount} vulnerabilidades CRÍTICAS`, {
            total: vulnCount,
            critical: criticalCount,
            high: highCount,
          });
        } else if (highCount > 0) {
          this.log('WARNING', `Encontradas ${highCount} vulnerabilidades ALTAS`, {
            total: vulnCount,
            high: highCount,
          });
        } else {
          this.log('WARNING', `Encontradas ${vulnCount} vulnerabilidades menores`);
        }
      } else {
        this.log('PASS', 'No se encontraron vulnerabilidades en dependencias');
      }
      
    } catch (error) {
      this.log('WARNING', 'No se pudo ejecutar npm audit', error.message);
    }
  }

  async testSecurityHeaders() {
    console.log('\n🛡️  Verificando headers de seguridad...');
    
    const requiredHeaders = {
      'x-frame-options': 'Protección contra clickjacking',
      'x-content-type-options': 'Prevención de MIME sniffing',
      'x-xss-protection': 'Protección XSS básica',
      'strict-transport-security': 'HTTPS forzado',
      'content-security-policy': 'Política de seguridad de contenido',
      'referrer-policy': 'Control de información de referrer',
    };
    
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, (res) => {
        Object.entries(requiredHeaders).forEach(([header, description]) => {
          if (res.headers[header]) {
            this.log('PASS', `Header ${header} presente`, {
              value: res.headers[header],
              description,
            });
          } else {
            this.log('WARNING', `Header ${header} faltante`, {
              description,
              recommendation: `Agregar header ${header} para mejorar seguridad`,
            });
          }
        });
        
        // Verificar headers problemáticos
        if (res.headers['server']) {
          this.log('WARNING', 'Header Server expone información del servidor', {
            value: res.headers['server'],
            recommendation: 'Ocultar o modificar header Server',
          });
        }
        
        resolve();
      });
      
      req.on('error', () => {
        this.log('ERROR', 'No se pudieron verificar headers de seguridad');
        resolve();
      });
    });
  }

  async testAuthenticationSecurity() {
    console.log('\n🔐 Probando seguridad de autenticación...');
    
    // Probar login con credenciales débiles
    const weakCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'admin', password: 'password' },
      { username: 'admin', password: '123456' },
      { username: 'test', password: 'test' },
      { username: 'user', password: 'user' },
    ];
    
    for (const cred of weakCredentials) {
      await this.testLogin(cred.username, cred.password, true);
    }
    
    // Probar ataques de fuerza bruta
    await this.testBruteForceProtection();
  }

  async testLogin(username, password, isWeakTest = false) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ username, password });
      
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200 && isWeakTest) {
            this.log('VULNERABILITY', `Credenciales débiles aceptadas: ${username}/${password}`);
          } else if (res.statusCode === 401 && isWeakTest) {
            this.log('PASS', `Credenciales débiles rechazadas: ${username}/${password}`);
          }
          resolve({ statusCode: res.statusCode, data });
        });
      });
      
      req.on('error', () => resolve({ statusCode: 500, data: '' }));
      req.write(postData);
      req.end();
    });
  }

  async testBruteForceProtection() {
    console.log('  🔄 Probando protección contra fuerza bruta...');
    
    const attempts = [];
    const startTime = Date.now();
    
    // Realizar 10 intentos rápidos
    for (let i = 0; i < 10; i++) {
      const result = await this.testLogin('admin', `wrongpass${i}`);
      attempts.push({
        attempt: i + 1,
        statusCode: result.statusCode,
        timestamp: Date.now(),
      });
      
      // Pausa mínima entre intentos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalTime = Date.now() - startTime;
    const avgTimePerAttempt = totalTime / attempts.length;
    
    // Verificar si hay rate limiting
    const rateLimitedAttempts = attempts.filter(a => a.statusCode === 429).length;
    
    if (rateLimitedAttempts > 0) {
      this.log('PASS', `Protección contra fuerza bruta detectada (${rateLimitedAttempts} requests bloqueados)`);
    } else if (avgTimePerAttempt < 500) {
      this.log('WARNING', 'Posible falta de protección contra fuerza bruta', {
        avgTimePerAttempt: `${avgTimePerAttempt}ms`,
        recommendation: 'Implementar rate limiting en endpoints de autenticación',
      });
    } else {
      this.log('PASS', 'Tiempo de respuesta adecuado para prevenir fuerza bruta');
    }
  }

  async testApiEndpointsSecurity() {
    console.log('\n🌐 Probando seguridad de endpoints API...');
    
    const endpoints = [
      { path: '/api/employees', method: 'GET' },
      { path: '/api/shifts', method: 'GET' },
      { path: '/api/users', method: 'GET' },
      { path: '/api/admin', method: 'GET' },
    ];
    
    for (const endpoint of endpoints) {
      await this.testEndpointWithoutAuth(endpoint);
    }
  }

  async testEndpointWithoutAuth(endpoint) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: endpoint.method,
      };
      
      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          this.log('VULNERABILITY', `Endpoint sin autenticación: ${endpoint.method} ${endpoint.path}`, {
            statusCode: res.statusCode,
            recommendation: 'Requerir autenticación para este endpoint',
          });
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          this.log('PASS', `Endpoint protegido: ${endpoint.method} ${endpoint.path}`);
        }
        resolve();
      });
      
      req.on('error', () => resolve());
      req.end();
    });
  }

  async testInputValidation() {
    console.log('\n🧪 Probando validación de entrada...');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '\'"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
    ];
    
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
    ];
    
    // Probar XSS en formularios
    for (const payload of xssPayloads) {
      await this.testXssPayload(payload);
    }
    
    // Probar SQL injection
    for (const payload of sqlPayloads) {
      await this.testSqlInjection(payload);
    }
  }

  async testXssPayload(payload) {
    // Test en endpoint de login
    const result = await this.testLogin(payload, 'password');
    
    if (result.data && result.data.includes(payload)) {
      this.log('VULNERABILITY', 'Posible vulnerabilidad XSS detectada', {
        payload,
        endpoint: '/api/auth/login',
        recommendation: 'Sanitizar entrada y escapar salida HTML',
      });
    }
  }

  async testSqlInjection(payload) {
    const result = await this.testLogin(payload, 'password');
    
    // Buscar indicadores de error SQL
    const sqlErrorIndicators = [
      'sql',
      'mysql',
      'postgresql',
      'sqlite',
      'syntax error',
      'database',
    ];
    
    const hasError = sqlErrorIndicators.some(indicator => 
      result.data.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasError) {
      this.log('VULNERABILITY', 'Posible vulnerabilidad SQL Injection detectada', {
        payload,
        endpoint: '/api/auth/login',
        recommendation: 'Usar consultas parametrizadas y validar entrada',
      });
    }
  }

  async testSessionManagement() {
    console.log('\n🍪 Probando gestión de sesiones...');
    
    // Probar configuración de cookies
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, (res) => {
        const cookies = res.headers['set-cookie'];
        
        if (cookies) {
          cookies.forEach(cookie => {
            if (cookie.includes('HttpOnly')) {
              this.log('PASS', 'Cookie con flag HttpOnly encontrada');
            } else {
              this.log('WARNING', 'Cookie sin flag HttpOnly', {
                cookie: cookie.split(';')[0],
                recommendation: 'Agregar flag HttpOnly a cookies de sesión',
              });
            }
            
            if (cookie.includes('Secure')) {
              this.log('PASS', 'Cookie con flag Secure encontrada');
            } else {
              this.log('WARNING', 'Cookie sin flag Secure', {
                cookie: cookie.split(';')[0],
                recommendation: 'Agregar flag Secure para HTTPS',
              });
            }
            
            if (cookie.includes('SameSite')) {
              this.log('PASS', 'Cookie con SameSite encontrada');
            } else {
              this.log('WARNING', 'Cookie sin SameSite', {
                cookie: cookie.split(';')[0],
                recommendation: 'Agregar SameSite para prevenir CSRF',
              });
            }
          });
        } else {
          this.log('INFO', 'No se encontraron cookies en la respuesta');
        }
        
        resolve();
      });
      
      req.on('error', () => resolve());
    });
  }

  async testDataExposure() {
    console.log('\n🔍 Probando exposición de datos sensibles...');
    
    const sensitiveEndpoints = [
      '/api/config',
      '/api/env',
      '/api/debug',
      '/.env',
      '/config.json',
      '/package.json',
      '/api/health/detailed',
    ];
    
    for (const endpoint of sensitiveEndpoints) {
      await this.testSensitiveDataExposure(endpoint);
    }
  }

  async testSensitiveDataExposure(endpoint) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: endpoint,
        method: 'GET',
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            // Buscar datos sensibles en la respuesta
            const sensitivePatterns = [
              /password/i,
              /secret/i,
              /key/i,
              /token/i,
              /api[_-]?key/i,
              /database[_-]?url/i,
              /connection[_-]?string/i,
            ];
            
            const foundSensitive = sensitivePatterns.some(pattern => 
              pattern.test(data)
            );
            
            if (foundSensitive) {
              this.log('VULNERABILITY', `Datos sensibles expuestos en ${endpoint}`, {
                statusCode: res.statusCode,
                recommendation: 'Restringir acceso o filtrar datos sensibles',
              });
            } else {
              this.log('WARNING', `Endpoint accesible: ${endpoint}`, {
                statusCode: res.statusCode,
                recommendation: 'Verificar si este endpoint debe ser público',
              });
            }
          }
          resolve();
        });
      });
      
      req.on('error', () => resolve());
      req.end();
    });
  }

  async generateReport() {
    console.log('\n📋 Generando reporte de seguridad...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.reportPath, `security-report-${timestamp}.json`);
    const htmlReportFile = path.join(this.reportPath, `security-report-${timestamp}.html`);
    
    // Resumen de resultados
    const summary = {
      timestamp: this.results.timestamp,
      totalTests: this.results.vulnerabilities.length + this.results.warnings.length + this.results.passed.length,
      vulnerabilities: this.results.vulnerabilities.length,
      warnings: this.results.warnings.length,
      passed: this.results.passed.length,
      riskLevel: this.calculateRiskLevel(),
    };
    
    const fullReport = {
      summary,
      results: this.results,
      recommendations: this.generateRecommendations(),
    };
    
    // Guardar reporte JSON
    fs.writeFileSync(reportFile, JSON.stringify(fullReport, null, 2));
    
    // Generar reporte HTML
    const htmlContent = this.generateHtmlReport(fullReport);
    fs.writeFileSync(htmlReportFile, htmlContent);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE SEGURIDAD WAOK-Schedule');
    console.log('='.repeat(60));
    console.log(`🔴 Vulnerabilidades críticas: ${summary.vulnerabilities}`);
    console.log(`🟡 Advertencias: ${summary.warnings}`);
    console.log(`🟢 Pruebas pasadas: ${summary.passed}`);
    console.log(`📈 Nivel de riesgo: ${summary.riskLevel}`);
    console.log('='.repeat(60));
    console.log(`📄 Reporte JSON: ${reportFile}`);
    console.log(`📄 Reporte HTML: ${htmlReportFile}`);
    
    if (summary.vulnerabilities > 0) {
      console.log('\n⚠️  SE ENCONTRARON VULNERABILIDADES CRÍTICAS');
      console.log('   Revisar el reporte y aplicar las correcciones recomendadas.');
      process.exit(1);
    } else if (summary.warnings > 0) {
      console.log('\n💡 Se encontraron advertencias de seguridad');
      console.log('   Se recomienda revisar y mejorar estos aspectos.');
    } else {
      console.log('\n✅ No se encontraron problemas críticos de seguridad');
    }
  }

  calculateRiskLevel() {
    const vulnerabilities = this.results.vulnerabilities.length;
    const warnings = this.results.warnings.length;
    
    if (vulnerabilities >= 3) return 'CRÍTICO';
    if (vulnerabilities >= 1) return 'ALTO';
    if (warnings >= 5) return 'MEDIO';
    if (warnings >= 1) return 'BAJO';
    return 'MÍNIMO';
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Basado en vulnerabilidades encontradas
    if (this.results.vulnerabilities.length > 0) {
      recommendations.push({
        priority: 'CRÍTICA',
        action: 'Corregir todas las vulnerabilidades identificadas inmediatamente',
        impact: 'Riesgo de compromiso de seguridad',
      });
    }
    
    // Basado en advertencias
    if (this.results.warnings.length > 0) {
      recommendations.push({
        priority: 'ALTA',
        action: 'Implementar headers de seguridad faltantes',
        impact: 'Mejora la postura de seguridad general',
      });
      
      recommendations.push({
        priority: 'MEDIA',
        action: 'Configurar rate limiting y protección CSRF',
        impact: 'Previene ataques automatizados',
      });
    }
    
    recommendations.push({
      priority: 'BAJA',
      action: 'Implementar monitoreo continuo de seguridad',
      impact: 'Detección temprana de nuevas vulnerabilidades',
    });
    
    return recommendations;
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Seguridad - WAOK Schedule</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5rem; font-weight: 300; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; border-radius: 8px; }
        .critical { background: #fee; border-left: 4px solid #e53e3e; }
        .warning { background: #fffbeb; border-left: 4px solid #f6ad55; }
        .success { background: #f0fff4; border-left: 4px solid #38a169; }
        .metric-value { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9rem; }
        .section { padding: 30px; border-top: 1px solid #eee; }
        .section h2 { color: #2d3748; margin-bottom: 20px; }
        .issue { background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #dee2e6; }
        .issue.vulnerability { border-left-color: #e53e3e; background: #fee; }
        .issue.warning { border-left-color: #f6ad55; background: #fffbeb; }
        .issue.pass { border-left-color: #38a169; background: #f0fff4; }
        .issue-title { font-weight: 600; margin-bottom: 8px; }
        .issue-details { font-size: 0.9rem; color: #666; }
        .recommendations { background: #f7fafc; }
        .recommendation { background: white; border-radius: 6px; padding: 15px; margin-bottom: 10px; border-left: 3px solid #4299e1; }
        .priority { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
        .priority.critical { background: #fed7d7; color: #c53030; }
        .priority.high { background: #feebc8; color: #dd6b20; }
        .priority.medium { background: #bee3f8; color: #2b6cb0; }
        .priority.low { background: #c6f6d5; color: #2f855a; }
        .timestamp { text-align: center; padding: 20px; color: #666; font-size: 0.9rem; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Reporte de Seguridad</h1>
            <p>WAOK Schedule - Análisis Completo</p>
        </div>
        
        <div class="summary">
            <div class="metric critical">
                <div class="metric-value">${report.summary.vulnerabilities}</div>
                <div class="metric-label">Vulnerabilidades</div>
            </div>
            <div class="metric warning">
                <div class="metric-value">${report.summary.warnings}</div>
                <div class="metric-label">Advertencias</div>
            </div>
            <div class="metric success">
                <div class="metric-value">${report.summary.passed}</div>
                <div class="metric-label">Pruebas Pasadas</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.riskLevel}</div>
                <div class="metric-label">Nivel de Riesgo</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔴 Vulnerabilidades Críticas</h2>
            ${report.results.vulnerabilities.map(v => `
                <div class="issue vulnerability">
                    <div class="issue-title">${v.message}</div>
                    <div class="issue-details">
                        <strong>Timestamp:</strong> ${v.timestamp}<br>
                        ${v.details ? `<strong>Detalles:</strong> ${JSON.stringify(v.details, null, 2)}` : ''}
                    </div>
                </div>
            `).join('')}
            ${report.results.vulnerabilities.length === 0 ? '<p>✅ No se encontraron vulnerabilidades críticas</p>' : ''}
        </div>
        
        <div class="section">
            <h2>🟡 Advertencias</h2>
            ${report.results.warnings.map(w => `
                <div class="issue warning">
                    <div class="issue-title">${w.message}</div>
                    <div class="issue-details">
                        <strong>Timestamp:</strong> ${w.timestamp}<br>
                        ${w.details ? `<strong>Detalles:</strong> ${JSON.stringify(w.details, null, 2)}` : ''}
                    </div>
                </div>
            `).join('')}
            ${report.results.warnings.length === 0 ? '<p>✅ No se encontraron advertencias</p>' : ''}
        </div>
        
        <div class="section">
            <h2>🟢 Pruebas Pasadas</h2>
            ${report.results.passed.map(p => `
                <div class="issue pass">
                    <div class="issue-title">${p.message}</div>
                    <div class="issue-details">
                        <strong>Timestamp:</strong> ${p.timestamp}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="section recommendations">
            <h2>💡 Recomendaciones</h2>
            ${report.recommendations.map(r => `
                <div class="recommendation">
                    <span class="priority ${r.priority.toLowerCase()}">${r.priority}</span>
                    <strong>${r.action}</strong><br>
                    <small>${r.impact}</small>
                </div>
            `).join('')}
        </div>
        
        <div class="timestamp">
            Generado el ${new Date(report.summary.timestamp).toLocaleString('es-ES')}
        </div>
    </div>
</body>
</html>
    `;
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, details };
    
    switch (level) {
      case 'VULNERABILITY':
        this.results.vulnerabilities.push(logEntry);
        console.log(`🔴 ${message}`);
        break;
      case 'WARNING':
        this.results.warnings.push(logEntry);
        console.log(`🟡 ${message}`);
        break;
      case 'PASS':
        this.results.passed.push(logEntry);
        console.log(`🟢 ${message}`);
        break;
      default:
        console.log(`ℹ️  ${message}`);
    }
    
    if (details) {
      console.log(`   📋 ${JSON.stringify(details, null, 2)}`);
    }
  }
}

// Función principal para ejecutar todas las pruebas
async function runSecurityTests() {
  console.log('🔒 WAOK-Schedule Security Test Suite v1.0');
  console.log('=' .repeat(50));
  
  const tester = new SecurityTester();
  
  try {
    // Ejecutar todas las categorías de pruebas
    await tester.testDependencyVulnerabilities();
    await tester.testSecurityHeaders();
    await tester.testAuthentication();
    await tester.testApiEndpoints();
    await tester.testInputValidation();
    await tester.testSessionManagement();
    await tester.testDataExposure();
    
    // Generar reporte final
    await tester.generateReport();
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas de seguridad:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  runSecurityTests();
}

module.exports = { SecurityTester, runSecurityTests };