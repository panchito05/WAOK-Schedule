#!/usr/bin/env node

/**
 * ARCHITECT-AI Health Check Script
 * Auto-diagnóstico del sistema para detectar problemas y generar reportes
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class HealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'HEALTHY',
      checks: [],
      metrics: {},
      issues: [],
      recommendations: []
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  addCheck(name, status, details = null, metrics = null) {
    this.results.checks.push({
      name,
      status,
      details,
      metrics,
      timestamp: new Date().toISOString()
    });

    if (status === 'FAIL') {
      this.results.status = 'UNHEALTHY';
      this.results.issues.push({ check: name, details });
    } else if (status === 'WARN' && this.results.status === 'HEALTHY') {
      this.results.status = 'WARNING';
    }
  }

  checkDependencies() {
    this.log('Verificando dependencias...');
    try {
      const packageJsonPath = join(projectRoot, 'package.json');
      if (!existsSync(packageJsonPath)) {
        this.addCheck('Dependencies', 'FAIL', 'package.json no encontrado');
        return;
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const totalDeps = Object.keys(packageJson.dependencies || {}).length +
                       Object.keys(packageJson.devDependencies || {}).length;

      // Verificar node_modules
      const nodeModulesPath = join(projectRoot, 'node_modules');
      if (!existsSync(nodeModulesPath)) {
        this.addCheck('Dependencies', 'FAIL', 'node_modules no encontrado. Ejecute npm install');
        return;
      }

      // Verificar dependencias críticas de testing
      const criticalTestDeps = ['vitest', '@testing-library/react', '@testing-library/jest-dom'];
      const missingTestDeps = criticalTestDeps.filter(dep => 
        !packageJson.devDependencies?.[dep] && !packageJson.dependencies?.[dep]
      );

      if (missingTestDeps.length > 0) {
        this.addCheck('Test Dependencies', 'WARN', 
          `Dependencias de testing faltantes: ${missingTestDeps.join(', ')}`);
      } else {
        this.addCheck('Test Dependencies', 'PASS', 'Todas las dependencias de testing están presentes');
      }

      this.addCheck('Dependencies', 'PASS', 
        `${totalDeps} dependencias verificadas`, { totalDependencies: totalDeps });
      
    } catch (error) {
      this.addCheck('Dependencies', 'FAIL', `Error verificando dependencias: ${error.message}`);
    }
  }

  checkTypeScript() {
    this.log('Verificando TypeScript...');
    try {
      const tsconfigPath = join(projectRoot, 'tsconfig.json');
      if (!existsSync(tsconfigPath)) {
        this.addCheck('TypeScript Config', 'FAIL', 'tsconfig.json no encontrado');
        return;
      }

      // Ejecutar type checking
      const startTime = Date.now();
      execSync('npx tsc --noEmit', { cwd: projectRoot, stdio: 'pipe' });
      const checkTime = Date.now() - startTime;

      this.addCheck('TypeScript', 'PASS', 'Sin errores de tipado', 
        { typeCheckTime: `${checkTime}ms` });
      
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
      this.addCheck('TypeScript', 'FAIL', `Errores de tipado encontrados: ${errorOutput}`);
    }
  }

  checkTestFiles() {
    this.log('Verificando archivos de test...');
    try {
      // Buscar archivos de test
      const testFiles = [];
      const searchDirs = [
        join(projectRoot, 'client', 'src'),
        join(projectRoot, 'server'),
        join(projectRoot, 'tests')
      ];

      const findTestFiles = (dir) => {
        if (!existsSync(dir)) return;
        
        try {
          const items = execSync(`find "${dir}" -name "*.test.*" -o -name "*.spec.*" 2>/dev/null || echo ""`, 
            { encoding: 'utf8', cwd: projectRoot }).trim();
          if (items) {
            testFiles.push(...items.split('\n').filter(Boolean));
          }
        } catch (e) {
          // Ignorar errores de find en Windows
        }
      };

      searchDirs.forEach(findTestFiles);

      if (testFiles.length === 0) {
        this.addCheck('Test Files', 'WARN', 'No se encontraron archivos de test');
        this.results.recommendations.push('Considere agregar tests unitarios para mejorar la cobertura');
      } else {
        this.addCheck('Test Files', 'PASS', 
          `${testFiles.length} archivos de test encontrados`, 
          { testFileCount: testFiles.length });
      }

    } catch (error) {
      this.addCheck('Test Files', 'FAIL', `Error buscando archivos de test: ${error.message}`);
    }
  }

  checkTestCoverage() {
    this.log('Verificando cobertura de tests...');
    try {
      // Ejecutar tests con cobertura
      const result = execSync('npm run test:coverage -- --reporter=json --reporter=text', 
        { cwd: projectRoot, encoding: 'utf8', stdio: 'pipe' });
      
      // Buscar información de cobertura en el output
      const lines = result.split('\n');
      const coverageLine = lines.find(line => line.includes('% Coverage'));
      
      if (coverageLine) {
        const coverage = parseFloat(coverageLine.match(/([0-9.]+)%/)?.[1] || '0');
        
        if (coverage >= 90) {
          this.addCheck('Test Coverage', 'PASS', 
            `Cobertura excelente: ${coverage}%`, { coverage: `${coverage}%` });
        } else if (coverage >= 70) {
          this.addCheck('Test Coverage', 'WARN', 
            `Cobertura aceptable: ${coverage}%`, { coverage: `${coverage}%` });
          this.results.recommendations.push('Aumentar cobertura de tests al 90% o superior');
        } else {
          this.addCheck('Test Coverage', 'FAIL', 
            `Cobertura insuficiente: ${coverage}%`, { coverage: `${coverage}%` });
        }
      } else {
        this.addCheck('Test Coverage', 'WARN', 'No se pudo determinar la cobertura');
      }

    } catch (error) {
      this.addCheck('Test Coverage', 'WARN', 
        `Error ejecutando tests de cobertura: ${error.message}`);
    }
  }

  checkBuildProcess() {
    this.log('Verificando proceso de build...');
    try {
      const startTime = Date.now();
      execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      const buildTime = Date.now() - startTime;

      // Verificar que se generaron los archivos de build
      const distPath = join(projectRoot, 'dist');
      if (existsSync(distPath)) {
        this.addCheck('Build Process', 'PASS', 
          `Build exitoso en ${buildTime}ms`, { buildTime: `${buildTime}ms` });
      } else {
        this.addCheck('Build Process', 'FAIL', 'Build completado pero no se generó la carpeta dist');
      }

    } catch (error) {
      this.addCheck('Build Process', 'FAIL', 
        `Error en el proceso de build: ${error.message}`);
    }
  }

  checkSecurityVulnerabilities() {
    this.log('Verificando vulnerabilidades de seguridad...');
    try {
      const result = execSync('npm audit --json', { cwd: projectRoot, encoding: 'utf8' });
      const auditResult = JSON.parse(result);
      
      const vulnerabilities = auditResult.metadata?.vulnerabilities || {};
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);

      if (totalVulns === 0) {
        this.addCheck('Security', 'PASS', 'No se encontraron vulnerabilidades');
      } else {
        const critical = vulnerabilities.critical || 0;
        const high = vulnerabilities.high || 0;
        
        if (critical > 0 || high > 0) {
          this.addCheck('Security', 'FAIL', 
            `${totalVulns} vulnerabilidades encontradas (${critical} críticas, ${high} altas)`,
            { totalVulnerabilities: totalVulns, critical, high });
          this.results.recommendations.push('Ejecutar npm audit fix para resolver vulnerabilidades');
        } else {
          this.addCheck('Security', 'WARN', 
            `${totalVulns} vulnerabilidades menores encontradas`,
            { totalVulnerabilities: totalVulns });
        }
      }

    } catch (error) {
      this.addCheck('Security', 'WARN', `Error ejecutando audit: ${error.message}`);
    }
  }

  generateReport() {
    this.log('Generando reporte...');
    
    const reportPath = join(projectRoot, 'logs', `health-check-${new Date().toISOString().split('T')[0]}.json`);
    const htmlReportPath = join(projectRoot, 'logs', `health-check-${new Date().toISOString().split('T')[0]}.html`);
    
    // Asegurar que existe el directorio logs
    try {
      execSync(`mkdir -p "${join(projectRoot, 'logs')}"`, { cwd: projectRoot });
    } catch (e) {
      // Ignorar errores de mkdir
    }

    // Reporte JSON
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Reporte HTML
    const htmlReport = this.generateHTMLReport();
    writeFileSync(htmlReportPath, htmlReport);

    this.log(`Reporte JSON generado: ${reportPath}`);
    this.log(`Reporte HTML generado: ${htmlReportPath}`);

    return { jsonPath: reportPath, htmlPath: htmlReportPath };
  }

  generateHTMLReport() {
    const statusColor = {
      'HEALTHY': '#22c55e',
      'WARNING': '#f59e0b', 
      'UNHEALTHY': '#ef4444'
    };

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WAOK Schedule - Health Check Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 600; color: white; }
        .checks { display: grid; gap: 16px; }
        .check { background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .check-header { display: flex; justify-content: between; align-items: center; margin-bottom: 8px; }
        .check-status { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .pass { background: #22c55e; color: white; }
        .warn { background: #f59e0b; color: white; }
        .fail { background: #ef4444; color: white; }
        .metrics { margin-top: 8px; padding: 8px; background: #f1f5f9; border-radius: 4px; font-size: 14px; }
        .recommendations { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .recommendations ul { margin: 0; padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WAOK Schedule - Health Check Report</h1>
            <p><strong>Timestamp:</strong> ${this.results.timestamp}</p>
            <p><strong>Status:</strong> <span class="status" style="background-color: ${statusColor[this.results.status]}">${this.results.status}</span></p>
        </div>
        
        <div class="checks">
            ${this.results.checks.map(check => `
                <div class="check">
                    <div class="check-header">
                        <h3>${check.name}</h3>
                        <span class="check-status ${check.status.toLowerCase()}">${check.status}</span>
                    </div>
                    ${check.details ? `<p>${check.details}</p>` : ''}
                    ${check.metrics ? `<div class="metrics">${Object.entries(check.metrics).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join(' | ')}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        ${this.results.recommendations.length > 0 ? `
            <div class="recommendations">
                <h2>Recomendaciones</h2>
                <ul>
                    ${this.results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Generado por ARCHITECT-AI Auto-Diagnóstico • ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  async run() {
    this.log('=== ARCHITECT-AI Health Check Iniciado ===');
    
    this.checkDependencies();
    this.checkTypeScript();
    this.checkTestFiles();
    this.checkTestCoverage();
    this.checkBuildProcess();
    this.checkSecurityVulnerabilities();
    
    const reports = this.generateReport();
    
    this.log('=== Health Check Completado ===');
    this.log(`Status: ${this.results.status}`);
    this.log(`Checks ejecutados: ${this.results.checks.length}`);
    this.log(`Issues encontrados: ${this.results.issues.length}`);
    
    if (this.results.status === 'UNHEALTHY') {
      this.log('⚠️  Sistema UNHEALTHY - Revisar issues críticos', 'ERROR');
      process.exit(1);
    } else if (this.results.status === 'WARNING') {
      this.log('⚠️  Sistema con warnings - Revisar recomendaciones', 'WARN');
    } else {
      this.log('✅ Sistema HEALTHY - Todo funcionando correctamente', 'SUCCESS');
    }
    
    return this.results;
  }
}

// Ejecutar health check si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const healthChecker = new HealthChecker();
  healthChecker.run().catch(error => {
    console.error('Error ejecutando health check:', error);
    process.exit(1);
  });
}

export default HealthChecker;