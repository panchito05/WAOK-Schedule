module.exports = {
  ci: {
    collect: {
      // URLs a auditar
      url: [
        'http://localhost:5000',
        'http://localhost:5000/login',
        'http://localhost:5000/dashboard',
        'http://localhost:5000/employees',
        'http://localhost:5000/shifts',
      ],
      // Configuración del servidor
      startServerCommand: 'npm run dev:win',
      startServerReadyPattern: 'Server running on',
      startServerReadyTimeout: 30000,
      // Configuración de colección
      numberOfRuns: 3, // Ejecutar 3 veces cada URL para promedio
      settings: {
        // Configuración de Chrome
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless',
        // Configuración de red (simular 3G lento)
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        },
        // Configuración de dispositivo móvil
        emulatedFormFactor: 'mobile',
        // Auditorías específicas
        onlyAudits: [
          'first-contentful-paint',
          'largest-contentful-paint',
          'cumulative-layout-shift',
          'total-blocking-time',
          'speed-index',
          'interactive',
          'server-response-time',
          'render-blocking-resources',
          'unused-css-rules',
          'unused-javascript',
          'modern-image-formats',
          'uses-responsive-images',
          'efficient-animated-content',
          'preload-lcp-image',
          'uses-rel-preconnect',
          'font-display',
          'third-party-summary',
        ],
      },
    },
    assert: {
      // Assertions para Performance
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.7 }],
        
        // Core Web Vitals críticos
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // < 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'total-blocking-time': ['error', { maxNumericValue: 300 }], // < 300ms
        'speed-index': ['error', { maxNumericValue: 3000 }], // < 3s
        'interactive': ['error', { maxNumericValue: 3500 }], // < 3.5s
        
        // Métricas de servidor y recursos
        'server-response-time': ['error', { maxNumericValue: 500 }], // < 500ms
        'render-blocking-resources': ['warn', { maxNumericValue: 1000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }], // < 20KB CSS no usado
        'unused-javascript': ['warn', { maxNumericValue: 50000 }], // < 50KB JS no usado
        
        // Optimizaciones de recursos
        'modern-image-formats': 'warn',
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
        'font-display': 'warn',
      },
    },
    upload: {
      // Configuración para guardar resultados
      target: 'filesystem',
      outputDir: './lighthouse/reports',
    },
    // Configuración del servidor temporal
    server: {
      command: 'npm run dev:win',
      port: 5000,
      ready: 'Server running on',
    },
  },
  
  // Configuración personalizada para WAOK-Schedule
  waokSchedule: {
    // Páginas críticas para el negocio
    criticalPages: [
      {
        name: 'Homepage',
        url: 'http://localhost:5000',
        expectedElements: ['#app', '.navbar', '.main-content'],
        criticalMetrics: {
          fcp: 1500, // First Contentful Paint < 1.5s
          lcp: 2000, // Largest Contentful Paint < 2s
          cls: 0.05, // Cumulative Layout Shift < 0.05
        },
      },
      {
        name: 'Dashboard',
        url: 'http://localhost:5000/dashboard',
        expectedElements: ['.dashboard', '.stats-cards', '.charts'],
        criticalMetrics: {
          fcp: 2000,
          lcp: 2500,
          cls: 0.1,
          tti: 3000, // Time to Interactive < 3s
        },
      },
      {
        name: 'Employee Management',
        url: 'http://localhost:5000/employees',
        expectedElements: ['.employee-list', '.add-employee-btn'],
        criticalMetrics: {
          fcp: 1800,
          lcp: 2200,
          cls: 0.08,
        },
      },
      {
        name: 'Shift Management',
        url: 'http://localhost:5000/shifts',
        expectedElements: ['.shift-calendar', '.shift-controls'],
        criticalMetrics: {
          fcp: 2000,
          lcp: 2800,
          cls: 0.1,
          tbt: 250, // Total Blocking Time < 250ms
        },
      },
    ],
    
    // Configuración de dispositivos para pruebas
    devices: [
      {
        name: 'Mobile',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        },
      },
      {
        name: 'Desktop',
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
        },
      },
    ],
    
    // Configuración de red para diferentes escenarios
    networkProfiles: {
      '3G-Slow': {
        rttMs: 300,
        throughputKbps: 400,
        cpuSlowdownMultiplier: 4,
      },
      '3G-Fast': {
        rttMs: 150,
        throughputKbps: 1600,
        cpuSlowdownMultiplier: 4,
      },
      '4G': {
        rttMs: 40,
        throughputKbps: 10000,
        cpuSlowdownMultiplier: 1,
      },
    },
    
    // Umbrales personalizados por tipo de página
    thresholds: {
      landing: {
        performance: 90,
        accessibility: 95,
        bestPractices: 90,
        seo: 95,
      },
      dashboard: {
        performance: 85,
        accessibility: 90,
        bestPractices: 85,
        seo: 80,
      },
      forms: {
        performance: 80,
        accessibility: 95,
        bestPractices: 85,
        seo: 75,
      },
    },
  },
};