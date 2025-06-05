#!/usr/bin/env node
/**
 * WAOK-Schedule Accessibility Testing Suite
 * Integra axe-core, Pa11y y Lighthouse para validaciones WCAG completas
 * Tiempo estimado: 1-2 minutos por ejecución
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const pa11y = require('pa11y');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

// Configuración de URLs críticas
const URLS_TO_TEST = [
  'http://localhost:5000',
  'http://localhost:5000/login',
  'http://localhost:5000/dashboard',
  'http://localhost:5000/employees',
  'http://localhost:5000/shifts',
];

// Configuración WCAG
const WCAG_CONFIG = {
  level: 'WCAG2AA', // WCAG 2.1 AA compliance
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  rules: {
    // Reglas críticas para lectores de pantalla
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'color-contrast': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'keyboard': { enabled: true },
    'tab-index': { enabled: true }
  }
};

class AccessibilityTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        violations: 0,
        warnings: 0,
        passed: 0
      },
      details: {
        axe: [],
        pa11y: [],
        lighthouse: []
      }
    };
  }

  async init() {
    console.log('🚀 Iniciando WAOK-Schedule Accessibility Test Suite');
    console.log('⏱️  Tiempo estimado: 1-2 minutos');
    console.log('📋 Validaciones: Screen readers, Keyboard nav, Color contrast, ARIA\n');

    // Verificar que el servidor esté corriendo
    await this.checkServer();

    // Ejecutar todas las pruebas
    await this.runAxeTests();
    await this.runPa11yTests();
    await this.runLighthouseAccessibilityTests();

    // Generar reporte
    await this.generateReport();
  }

  async checkServer() {
    try {
      const response = await fetch('http://localhost:5000');
      if (!response.ok) throw new Error('Server not responding');
      console.log('✅ Servidor detectado en http://localhost:5000\n');
    } catch (error) {
      console.error('❌ Error: Servidor no disponible en localhost:5000');
      console.log('💡 Ejecuta: npm run dev:win');
      process.exit(1);
    }
  }

  async runAxeTests() {
    console.log('🔍 Ejecutando pruebas Axe-core (WCAG 2.1 AA)...');
    
    const browser = await puppeteer.launch({ headless: true });
    
    for (const url of URLS_TO_TEST) {
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Inyectar axe-core
        await page.addScriptTag({ path: require.resolve('axe-core') });
        
        // Ejecutar análisis
        const results = await page.evaluate(async () => {
          return await axe.run({
            tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
            rules: {
              'color-contrast': { enabled: true },
              'keyboard': { enabled: true },
              'aria-valid-attr': { enabled: true },
              'button-name': { enabled: true },
              'image-alt': { enabled: true },
              'label': { enabled: true },
              'link-name': { enabled: true }
            }
          });
        });

        this.results.details.axe.push({
          url,
          violations: results.violations.length,
          passes: results.passes.length,
          incomplete: results.incomplete.length,
          details: results.violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            nodes: v.nodes.length
          }))
        });

        console.log(`  📄 ${url}: ${results.violations.length} violaciones`);
        await page.close();
        
      } catch (error) {
        console.error(`  ❌ Error en ${url}:`, error.message);
      }
    }
    
    await browser.close();
    console.log('✅ Axe-core completado\n');
  }

  async runPa11yTests() {
    console.log('🔍 Ejecutando pruebas Pa11y (navegación por teclado)...');
    
    for (const url of URLS_TO_TEST) {
      try {
        const results = await pa11y(url, {
          standard: 'WCAG2AA',
          actions: [
            'wait for element body to be visible',
            'keyboard tab',
            'keyboard shift+tab',
            'keyboard enter',
            'keyboard space'
          ],
          chromeLaunchConfig: {
            args: ['--no-sandbox', '--disable-dev-shm-usage']
          }
        });

        this.results.details.pa11y.push({
          url,
          issues: results.issues.length,
          details: results.issues.map(issue => ({
            type: issue.type,
            code: issue.code,
            message: issue.message,
            context: issue.context,
            selector: issue.selector
          }))
        });

        console.log(`  📄 ${url}: ${results.issues.length} problemas`);
        
      } catch (error) {
        console.error(`  ❌ Error en ${url}:`, error.message);
      }
    }
    
    console.log('✅ Pa11y completado\n');
  }

  async runLighthouseAccessibilityTests() {
    console.log('🔍 Ejecutando auditorías Lighthouse (accesibilidad completa)...');
    
    for (const url of URLS_TO_TEST) {
      try {
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
        
        const results = await lighthouse(url, {
          port: chrome.port,
          onlyCategories: ['accessibility'],
          settings: {
            formFactor: 'desktop',
            throttling: {
              rttMs: 40,
              throughputKbps: 10240,
              cpuSlowdownMultiplier: 1
            }
          }
        });

        const accessibilityScore = results.lhr.categories.accessibility.score * 100;
        const audits = Object.entries(results.lhr.audits)
          .filter(([, audit]) => audit.scoreDisplayMode !== 'notApplicable')
          .map(([id, audit]) => ({
            id,
            title: audit.title,
            score: audit.score,
            displayValue: audit.displayValue,
            description: audit.description
          }));

        this.results.details.lighthouse.push({
          url,
          accessibilityScore,
          audits: audits.filter(audit => audit.score < 1)
        });

        console.log(`  📄 ${url}: ${accessibilityScore}% accesibilidad`);
        
        await chrome.kill();
        
      } catch (error) {
        console.error(`  ❌ Error en ${url}:`, error.message);
      }
    }
    
    console.log('✅ Lighthouse completado\n');
  }

  async generateReport() {
    // Calcular estadísticas generales
    const axeViolations = this.results.details.axe.reduce((sum, result) => sum + result.violations, 0);
    const pa11yIssues = this.results.details.pa11y.reduce((sum, result) => sum + result.issues, 0);
    const avgAccessibilityScore = this.results.details.lighthouse.reduce((sum, result) => sum + result.accessibilityScore, 0) / this.results.details.lighthouse.length;

    this.results.summary = {
      axeViolations,
      pa11yIssues,
      avgAccessibilityScore: Math.round(avgAccessibilityScore),
      totalIssues: axeViolations + pa11yIssues
    };

    // Generar reporte HTML
    const reportHtml = this.generateHtmlReport();
    
    // Crear directorio de reportes
    const reportsDir = path.join(process.cwd(), 'accessibility-reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    // Guardar archivos
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      path.join(reportsDir, `accessibility-report-${timestamp}.html`),
      reportHtml
    );
    await fs.writeFile(
      path.join(reportsDir, `accessibility-data-${timestamp}.json`),
      JSON.stringify(this.results, null, 2)
    );

    // Mostrar resumen
    console.log('📊 RESUMEN DE ACCESIBILIDAD WAOK-Schedule');
    console.log('=' .repeat(50));
    console.log(`🎯 Puntuación promedio: ${this.results.summary.avgAccessibilityScore}%`);
    console.log(`⚠️  Violaciones Axe-core: ${axeViolations}`);
    console.log(`🚨 Problemas Pa11y: ${pa11yIssues}`);
    console.log(`📝 Total de problemas: ${this.results.summary.totalIssues}`);
    console.log('\n✅ Aspectos validados:');
    console.log('   • Compatibilidad con lectores de pantalla');
    console.log('   • Navegación por teclado');
    console.log('   • Contraste de color (WCAG AA)');
    console.log('   • Etiquetas ARIA correctas');
    console.log(`\n📄 Reporte guardado en: accessibility-reports/`);
    
    // Determinar si las pruebas pasaron
    const passed = this.results.summary.avgAccessibilityScore >= 90 && this.results.summary.totalIssues <= 5;
    
    if (passed) {
      console.log('\n🎉 ¡PRUEBAS DE ACCESIBILIDAD EXITOSAS!');
      process.exit(0);
    } else {
      console.log('\n❌ PRUEBAS DE ACCESIBILIDAD FALLARON');
      console.log('💡 Revisa el reporte para detalles de corrección');
      process.exit(1);
    }
  }

  generateHtmlReport() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAOK-Schedule - Reporte de Accesibilidad</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #2c3e50; margin: 0; }
    .header .timestamp { color: #7f8c8d; font-size: 14px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .metric { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .metric.success { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .metric.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .metric.error { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
    .metric h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; opacity: 0.9; }
    .metric .value { font-size: 32px; font-weight: bold; margin: 0; }
    .section { margin-bottom: 40px; }
    .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    .url-result { background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
    .url-result h4 { margin: 0 0 10px 0; color: #2c3e50; }
    .issue { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 4px; }
    .issue.violation { background: #f8d7da; border-color: #f5c6cb; }
    .issue.warning { background: #fff3cd; border-color: #ffeaa7; }
    .issue.pass { background: #d4edda; border-color: #c3e6cb; }
    .issue-details { font-size: 12px; color: #6c757d; margin-top: 5px; }
    .validation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .validation-item { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid #28a745; }
    .validation-item.fail { border-left-color: #dc3545; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 WAOK-Schedule - Reporte de Accesibilidad</h1>
      <div class="timestamp">Generado el: ${this.results.timestamp}</div>
    </div>
    
    <div class="summary">
      <div class="metric ${this.results.summary.avgAccessibilityScore >= 90 ? 'success' : this.results.summary.avgAccessibilityScore >= 70 ? 'warning' : 'error'}">
        <h3>Puntuación Promedio</h3>
        <div class="value">${this.results.summary.avgAccessibilityScore}%</div>
      </div>
      <div class="metric ${this.results.summary.axeViolations === 0 ? 'success' : this.results.summary.axeViolations <= 5 ? 'warning' : 'error'}">
        <h3>Violaciones Axe</h3>
        <div class="value">${this.results.summary.axeViolations}</div>
      </div>
      <div class="metric ${this.results.summary.pa11yIssues === 0 ? 'success' : this.results.summary.pa11yIssues <= 3 ? 'warning' : 'error'}">
        <h3>Problemas Pa11y</h3>
        <div class="value">${this.results.summary.pa11yIssues}</div>
      </div>
      <div class="metric ${this.results.summary.totalIssues === 0 ? 'success' : this.results.summary.totalIssues <= 8 ? 'warning' : 'error'}">
        <h3>Total Problemas</h3>
        <div class="value">${this.results.summary.totalIssues}</div>
      </div>
    </div>

    <div class="validation-grid">
      <div class="validation-item">
        <h4>✅ Screen Reader Compatibility</h4>
        <p>Validado con Axe-core y Pa11y</p>
      </div>
      <div class="validation-item">
        <h4>⌨️ Keyboard Navigation</h4>
        <p>Pruebas de Tab, Shift+Tab, Enter, Space</p>
      </div>
      <div class="validation-item">
        <h4>🎨 Color Contrast</h4>
        <p>WCAG 2.1 AA compliance</p>
      </div>
      <div class="validation-item">
        <h4>🏷️ ARIA Labels</h4>
        <p>Etiquetas y roles correctos</p>
      </div>
    </div>

    <div class="section">
      <h2>🔍 Resultados Axe-core (WCAG 2.1 AA)</h2>
      ${this.results.details.axe.map(result => `
        <div class="url-result">
          <h4>${result.url}</h4>
          <p><strong>Violaciones:</strong> ${result.violations} | <strong>Pruebas exitosas:</strong> ${result.passes}</p>
          ${result.details.map(detail => `
            <div class="issue violation">
              <strong>${detail.id}</strong> (${detail.impact})
              <div class="issue-details">${detail.description}</div>
              <div class="issue-details">Afecta ${detail.nodes} elemento(s)</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>⌨️ Resultados Pa11y (Navegación por Teclado)</h2>
      ${this.results.details.pa11y.map(result => `
        <div class="url-result">
          <h4>${result.url}</h4>
          <p><strong>Problemas encontrados:</strong> ${result.issues}</p>
          ${result.details.map(detail => `
            <div class="issue ${detail.type}">
              <strong>${detail.code}</strong>
              <div class="issue-details">${detail.message}</div>
              <div class="issue-details">Selector: ${detail.selector}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>🚀 Resultados Lighthouse (Auditoría Completa)</h2>
      ${this.results.details.lighthouse.map(result => `
        <div class="url-result">
          <h4>${result.url}</h4>
          <p><strong>Puntuación de Accesibilidad:</strong> ${result.accessibilityScore}%</p>
          ${result.audits.map(audit => `
            <div class="issue ${audit.score === 1 ? 'pass' : audit.score >= 0.5 ? 'warning' : 'violation'}">
              <strong>${audit.title}</strong>
              <div class="issue-details">${audit.description}</div>
              ${audit.displayValue ? `<div class="issue-details">Valor: ${audit.displayValue}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>🎯 Reporte generado por WAOK-Schedule Accessibility Test Suite</p>
      <p>Herramientas: Axe-core ${require('axe-core/package.json').version} | Pa11y ${require('pa11y/package.json').version} | Lighthouse ${require('lighthouse/package.json').version}</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// Inicializar y ejecutar las pruebas
if (require.main === module) {
  const tester = new AccessibilityTester();
  tester.init().catch(error => {
    console.error('❌ Error crítico en las pruebas de accesibilidad:', error);
    process.exit(1);
  });
}

module.exports = AccessibilityTester;