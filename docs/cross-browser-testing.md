# Cross-Browser Testing con WAOK-Schedule

## 📋 Resumen

Este documento describe la implementación de pruebas cross-browser para WAOK-Schedule utilizando Playwright con integración a BrowserStack y Sauce Labs.

## 🎯 Navegadores Objetivo

### Desktop
- **Chrome** (Latest)
- **Firefox** (Latest)
- **Safari** (Latest - macOS)
- **Edge** (Latest)

### Mobile
- **Chrome Mobile** (Android)
- **Safari Mobile** (iOS)

## ⚙️ Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# BrowserStack
BROWSERSTACK_USERNAME=tu_usuario
BROWSERSTACK_ACCESS_KEY=tu_access_key

# Sauce Labs
SAUCE_USERNAME=tu_usuario
SAUCE_ACCESS_KEY=tu_access_key

# Configuración base
BASE_URL=http://localhost:3000
```

### 2. Instalación de Dependencias

```bash
npm install
npx playwright install
```

## 🚀 Ejecución de Pruebas

### Pruebas Locales
```bash
# Todas las pruebas cross-browser
npm run test:cross-browser

# Navegador específico
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:edge

# Solo mobile
npm run test:mobile
```

### Pruebas en la Nube
```bash
# BrowserStack
npm run test:browserstack

# Sauce Labs
npm run test:saucelabs
```

## 📊 Reportes

Los reportes se generan en:

- **HTML**: `cross-browser-reports/html/index.html`
- **JSON**: `cross-browser-reports/json/results.json`
- **JUnit**: `cross-browser-reports/junit/results.xml`
- **Resumen**: `cross-browser-reports/test-summary.md`

## 🔧 Configuraciones

### Archivos de Configuración

1. **`playwright.cross-browser.config.ts`** - Configuración principal
2. **`browserstack.config.ts`** - Configuración específica para BrowserStack
3. **`saucelabs.config.ts`** - Configuración específica para Sauce Labs
4. **`cross-browser-setup.ts`** - Setup global
5. **`cross-browser-teardown.ts`** - Teardown y reportes

### Timeouts y Reintentos

- **Timeout por test**: 30 segundos
- **Reintentos**: 2 intentos por test fallido
- **Workers**: 4 procesos paralelos
- **Máximo de fallos**: 5 antes de abortar

## 🎯 Casos de Prueba

Las pruebas cubren:

1. **Navegación básica**
   - Carga de páginas principales
   - Navegación entre vistas
   - Responsive design

2. **Autenticación**
   - Login/logout
   - Validación de sesiones
   - Redirecciones

3. **Gestión de empleados**
   - CRUD de empleados
   - Filtros y búsquedas
   - Validación de formularios

4. **Gestión de turnos**
   - Creación de turnos
   - Asignación de empleados
   - Visualización de calendario

## 🌐 Plataformas de Testing

### BrowserStack
- ✅ Acceso a 3000+ navegadores reales
- ✅ Testing en dispositivos móviles reales
- ✅ Debugging con screenshots y videos
- ✅ Integración con CI/CD

### Sauce Labs
- ✅ Infraestructura global distribuida
- ✅ Testing paralelo masivo
- ✅ Analytics avanzados
- ✅ Sauce Connect para apps locales

## 📈 Métricas y KPIs

### Tiempo de Ejecución
- **Estimado**: 5-10 minutos por suite
- **Paralelo**: 4 workers simultáneos
- **Total**: ~15-20 minutos para todos los navegadores

### Cobertura
- **Navegadores**: 6 configuraciones desktop + mobile
- **Resoluciones**: 3 tamaños de pantalla
- **Sistemas**: Windows, macOS, iOS, Android

## 🚨 Troubleshooting

### Errores Comunes

1. **Timeout en BrowserStack/Sauce Labs**
   - Verificar credenciales en `.env`
   - Comprobar límites de concurrencia

2. **Fallos de navegador local**
   - Ejecutar `npx playwright install`
   - Verificar versiones de navegadores

3. **Tests flaky**
   - Aumentar timeouts en configuración
   - Revisar selectores CSS

### Logs y Debugging

```bash
# Modo debug
DEBUG=pw:api npm run test:cross-browser

# Con UI de Playwright
npx playwright test --ui --config=playwright.cross-browser.config.ts

# Screenshots en fallos
npm run test:cross-browser -- --screenshot=only-on-failure
```

## 📋 Checklist de Pre-Deploy

- [ ] Todas las pruebas pasan en Chrome
- [ ] Todas las pruebas pasan en Firefox
- [ ] Todas las pruebas pasan en Safari (si disponible)
- [ ] Todas las pruebas pasan en Edge
- [ ] Responsive funciona en mobile
- [ ] No hay errores de consola críticos
- [ ] Performance acceptable (<5s carga inicial)

## 🔄 Integración CI/CD

### GitHub Actions
```yaml
# .github/workflows/cross-browser.yml
name: Cross Browser Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:cross-browser
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en `cross-browser-reports/`
2. Consultar documentación de Playwright
3. Verificar estado de BrowserStack/Sauce Labs
4. Contactar al equipo de QA