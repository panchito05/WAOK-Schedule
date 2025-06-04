# Reporte de Métricas de Pruebas - WAOK Schedule

📊 **Generado:** 2024-12-19

## 📈 Cobertura de Código

| Métrica | Porcentaje | Ratio |
|---------|------------|-------|
| **Statements** | 0.35% | 47/13,166 |
| **Branches** | 8.16% | 8/98 |
| **Functions** | 3.29% | 3/91 |
| **Lines** | 0.35% | 47/13,166 |

## ⚡ Rendimiento de Pruebas

### Resumen General
- **Total de Pruebas:** 42 ✅
- **Archivos de Prueba:** 2
- **Tiempo Total:** 2.19s
- **Estado:** Todas las pruebas pasan

### Desglose por Tipo de Prueba

| Archivo | Tipo | Pruebas | Tiempo Aprox. | Descripción |
|---------|------|---------|---------------|-------------|
| `calculations.test.ts` | **Unit Tests** | 31 | ~1.1s | Pruebas matemáticas y cálculos |
| `usePreferences.test.ts` | **Hook Tests** | 11 | ~1.1s | Gestión de estado con hooks |

### Métricas de Performance Detalladas

| Fase | Tiempo | Descripción |
|------|--------|-------------|
| **Setup** | 839ms | Configuración inicial |
| **Environment** | 1.70s | Preparación del entorno |
| **Prepare** | 1.14s | Preparación de archivos |
| **Collect** | 75ms | Recolección de pruebas |
| **Tests** | 37ms | Ejecución real de pruebas |

## 🎯 Tiempo Promedio por Tipo

- **Unit Tests (Cálculos):** ~35ms por prueba
- **Hook Tests (Estado):** ~100ms por prueba
- **Configuración promedio:** ~42ms por archivo

## 📋 Análisis y Recomendaciones

### ⚠️ Áreas de Mejora
1. **Cobertura Crítica:** Solo 0.35% del código está cubierto
2. **Objetivo mínimo:** Alcanzar 90% de cobertura
3. **Pruebas faltantes:** Componentes React sin pruebas

### 🚀 Plan de Acción
1. **Prioridad Alta:** Agregar pruebas para componentes principales
2. **Prioridad Media:** Implementar pruebas de integración
3. **Prioridad Baja:** Configurar pruebas E2E para flujos críticos

### ✨ Puntos Positivos
- ✅ Todas las pruebas existentes pasan
- ✅ Tiempo de ejecución rápido (2.19s)
- ✅ Configuración de cobertura funcional
- ✅ Hook `usePreferences` bien probado (100% líneas)

---

**Nota:** Este reporte se actualiza automáticamente con cada ejecución de `npm run test:coverage`