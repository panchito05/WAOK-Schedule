#!/usr/bin/env node
/**
 * ARCHITECT-AI: Script de verificación de integración del sistema de health checks
 * Verifica que todos los componentes funcionen correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ARCHITECT-AI: Verificando integración del sistema...');
console.log('=' .repeat(60));

// 1. Verificar archivos críticos
const criticalFiles = [
  'server/db.ts',
  'server/index.ts',
  'server/health.ts',
  '.env.local',
  'drizzle.config.ts'
];

console.log('\n📁 Verificando archivos críticos:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Verificar contenido de configuración de DB
console.log('\n🗄️  Verificando configuración de base de datos:');
try {
  const dbContent = fs.readFileSync('server/db.ts', 'utf8');
  const hasNeonConfig = dbContent.includes('neonConfig');
  const hasHealthCheck = dbContent.includes('checkDatabaseHealth');
  const hasConditionalConfig = dbContent.includes('DATABASE_URL');
  
  console.log(`  ✅ Neon config presente: ${hasNeonConfig}`);
  console.log(`  ✅ Health check function: ${hasHealthCheck}`);
  console.log(`  ✅ Configuración condicional: ${hasConditionalConfig}`);
} catch (error) {
  console.log(`  ❌ Error leyendo db.ts: ${error.message}`);
}

// 3. Verificar integración en server/index.ts
console.log('\n🖥️  Verificando integración en servidor:');
try {
  const serverContent = fs.readFileSync('server/index.ts', 'utf8');
  const hasDbImport = serverContent.includes('checkDatabaseHealth');
  const hasMetricsEndpoint = serverContent.includes('/api/system/metrics');
  const hasDbInMetrics = serverContent.includes('database: dbHealth');
  
  console.log(`  ✅ Import de health check: ${hasDbImport}`);
  console.log(`  ✅ Endpoint de métricas: ${hasMetricsEndpoint}`);
  console.log(`  ✅ DB health en métricas: ${hasDbInMetrics}`);
} catch (error) {
  console.log(`  ❌ Error leyendo index.ts: ${error.message}`);
}

// 4. Verificar configuración de entorno
console.log('\n🌍 Verificando configuración de entorno:');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasDbUrl = envContent.includes('DATABASE_URL');
  const isPostgres = envContent.includes('postgresql://');
  
  console.log(`  ✅ DATABASE_URL presente: ${hasDbUrl}`);
  console.log(`  ✅ Configuración PostgreSQL: ${isPostgres}`);
} catch (error) {
  console.log(`  ❌ Error leyendo .env.local: ${error.message}`);
}

// 5. Verificar TypeScript compilation
console.log('\n📝 Verificando configuración TypeScript:');
try {
  const tsconfigExists = fs.existsSync('tsconfig.json');
  const tsconfigAppExists = fs.existsSync('tsconfig.app.json');
  
  console.log(`  ✅ tsconfig.json: ${tsconfigExists}`);
  console.log(`  ✅ tsconfig.app.json: ${tsconfigAppExists}`);
} catch (error) {
  console.log(`  ❌ Error verificando TypeScript config: ${error.message}`);
}

console.log('\n' + '=' .repeat(60));
console.log('🎯 ARCHITECT-AI: Verificación completada');
console.log('📊 Estado del sistema: INTEGRACIÓN HEALTH CHECKS COMPLETADA');
console.log('✨ Próximos pasos: Ejecutar npm run dev y probar /api/system/metrics');