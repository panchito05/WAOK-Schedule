// Script para inspeccionar turnos almacenados en localStorage
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para compatibilidad con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {

// Simular las claves de localStorage que usa la aplicación
const STORAGE_KEYS = [
  'employee-lists',
  'store-data',
  'shiftColumns_',
  'employeeSelections_',
  'scheduleRulesTableHidden',
  'employeeScheduleTableHidden',
  'employeesTableHidden',
  'selectedEmployeeIds'
];

console.log('🔍 [ARCHITECT-AI] Buscando turnos en la aplicación...');
console.log('\n=== CLAVES DE ALMACENAMIENTO ===');
STORAGE_KEYS.forEach(key => {
  console.log(`- ${key}`);
});

// Leer archivos de contexto para entender estructura
const contextFiles = [
  './client/src/context/EmployeeListsContext.tsx',
  './client/src/context/StoreContext.tsx',
  './client/src/context/ShiftContext.tsx',
  './client/src/components/EmployeeListsContext/index.tsx'
];

console.log('\n=== ESTRUCTURA DE DATOS DE TURNOS ===');
contextFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Buscar definiciones de shifts
    const shiftMatches = content.match(/shifts.*?:\s*\[.*?\]/gs);
    const defaultShiftMatches = content.match(/defaultShifts.*?=.*?\[.*?\]/gs);
    
    if (shiftMatches || defaultShiftMatches) {
      console.log(`\n📁 ${file}:`);
      
      if (shiftMatches) {
        shiftMatches.forEach(match => {
          console.log(`  - ${match.replace(/\s+/g, ' ').substring(0, 100)}...`);
        });
      }
      
      if (defaultShiftMatches) {
        defaultShiftMatches.forEach(match => {
          console.log(`  - ${match.replace(/\s+/g, ' ').substring(0, 100)}...`);
        });
      }
    }
  }
});

console.log('\n=== INSTRUCCIONES PARA EL USUARIO ===');
console.log('1. Abre el navegador en http://localhost:5000');
console.log('2. Presiona F12 para abrir DevTools');
console.log('3. Ve a la pestaña "Application" o "Aplicación"');
console.log('4. En el panel izquierdo, expande "Local Storage"');
console.log('5. Haz clic en "http://localhost:5000"');
console.log('6. Busca las siguientes claves:');
STORAGE_KEYS.forEach(key => {
  console.log(`   - ${key}`);
});
console.log('7. Copia y pega el contenido aquí');

console.log('\n✅ [ARCHITECT-AI] Script completado');

} catch (error) {
  console.error('Error:', error.message);
}