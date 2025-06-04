# 🚀 Guía de Inicio Rápido - WAOK-Schedule

## ⚡ Inicialización en 2 Comandos

### Para Windows (Recomendado)
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm run dev:win
```

**¡Listo!** Accede a: http://localhost:5000

---

## 🔧 Scripts de Inicialización Disponibles

| Comando | Descripción | Uso Recomendado |
|---------|-------------|----------------|
| `npm run quick-start` | Instalación + servidor | **Primer uso** |
| `npm run init:safe` | Inicialización segura | **Si hay problemas** |
| `npm run dev:win` | Solo servidor (Windows) | **Desarrollo diario** |
| `npm run dev` | Servidor multiplataforma | **Linux/Mac** |

---

## ⚠️ Problemas Comunes SOLUCIONADOS

### ✅ Error "require is not defined"
**SOLUCIONADO PERMANENTEMENTE**
- Archivos convertidos a ES Modules
- No requiere acción manual

### ✅ Fallos de npm ci
**SOLUCIÓN**: Usar `npm install` en lugar de `npm ci`
- Scripts actualizados para evitar este problema

### ✅ Problemas de permisos
**SOLUCIÓN**: Evitar `init:complete`, usar `quick-start`

---

## 📋 Verificación Post-Inicialización

```bash
# Verificar que todo funciona
npm run quick-check

# Diagnóstico completo (opcional)
npm run diagnose
```

---

## 🆘 Si Algo Falla

### Limpiar y Reiniciar
```bash
# Detener procesos
Get-Process node,npm,tsx | Stop-Process -Force

# Reinstalar
rm -rf node_modules
npm install

# Iniciar
npm run dev:win
```

### Verificar Puerto 5000
```bash
# Ver qué usa el puerto
netstat -ano | findstr :5000

# Detener proceso si es necesario
taskkill /F /PID <ID_DEL_PROCESO>
```

---

## 📝 Configuración Requerida

1. **Archivo .env**: Copia `.env.example` como `.env`
2. **Base de datos**: Configura `DATABASE_URL` en `.env`
3. **Node.js**: Versión 18+ requerida

---

## ✨ Funcionalidades Verificadas

- ✅ Servidor Express en puerto 5000
- ✅ Frontend React con Vite
- ✅ Hot reload automático
- ✅ TypeScript configurado
- ✅ Tailwind CSS funcionando
- ✅ Base de datos conectada
- ✅ Testing suite disponible

---

**🎯 COMANDO RECOMENDADO PARA NUEVOS USUARIOS:**
```bash
npm run quick-start
```

**🎯 COMANDO RECOMENDADO PARA USO DIARIO:**
```bash
npm run dev:win
```