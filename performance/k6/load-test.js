import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('error_rate');
const responseTimeError = new Counter('response_time_errors');
const loginDuration = new Trend('login_duration');

// Configuración de escenarios de carga
export const options = {
  scenarios: {
    // Prueba de carga ligera (usuarios normales)
    light_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 10 },  // Subida gradual
        { duration: '5m', target: 10 },  // Mantenimiento
        { duration: '2m', target: 0 },   // Bajada
      ],
      gracefulRampDown: '30s',
    },
    
    // Prueba de estrés (carga alta)
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },  // Subida rápida
        { duration: '3m', target: 50 },  // Mantenimiento
        { duration: '1m', target: 100 }, // Pico de estrés
        { duration: '2m', target: 0 },   // Bajada
      ],
      startTime: '10m', // Ejecutar después del light_load
    },
  },
  
  thresholds: {
    // Umbrales críticos de rendimiento
    http_req_duration: ['p(95)<500'], // 95% de requests < 500ms
    http_req_failed: ['rate<0.05'],   // Menos de 5% de errores
    error_rate: ['rate<0.05'],        // Tasa de error personalizada
    login_duration: ['p(90)<1000'],   // Login en menos de 1s para 90% usuarios
  },
};

const BASE_URL = 'http://localhost:5000';

// Datos de prueba
const testUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'manager', password: 'manager123' },
  { username: 'employee', password: 'employee123' },
];

const testEmployees = [
  { name: 'Juan Pérez', email: 'juan@test.com', position: 'Developer' },
  { name: 'María García', email: 'maria@test.com', position: 'Designer' },
  { name: 'Carlos López', email: 'carlos@test.com', position: 'Manager' },
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Grupo de prueba: Carga inicial de página
  group('Homepage Load', function() {
    const response = http.get(BASE_URL);
    
    check(response, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage loads in <2s': (r) => r.timings.duration < 2000,
      'homepage contains title': (r) => r.body.includes('WAOK Schedule'),
    });
    
    errorRate.add(response.status !== 200);
    
    if (response.timings.duration > 2000) {
      responseTimeError.add(1);
    }
  });
  
  sleep(1);
  
  // Grupo de prueba: Autenticación
  group('User Authentication', function() {
    const loginStart = Date.now();
    
    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
      username: user.username,
      password: user.password,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const loginTime = Date.now() - loginStart;
    loginDuration.add(loginTime);
    
    check(loginResponse, {
      'login status is 200': (r) => r.status === 200,
      'login response has token': (r) => r.json('token') !== undefined,
      'login completes in <1s': (r) => loginTime < 1000,
    });
    
    errorRate.add(loginResponse.status !== 200);
    
    // Extraer token para requests siguientes
    let token = '';
    if (loginResponse.status === 200) {
      token = loginResponse.json('token');
    }
    
    // Grupo de prueba: Operaciones con empleados
    if (token) {
      group('Employee Operations', function() {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        // Listar empleados
        const listResponse = http.get(`${BASE_URL}/api/employees`, { headers });
        check(listResponse, {
          'employees list loads': (r) => r.status === 200,
          'employees data is array': (r) => Array.isArray(r.json()),
        });
        
        // Crear empleado (solo algunos usuarios)
        if (Math.random() < 0.3) {
          const employee = testEmployees[Math.floor(Math.random() * testEmployees.length)];
          const createResponse = http.post(`${BASE_URL}/api/employees`, employee, { headers });
          
          check(createResponse, {
            'employee creation succeeds': (r) => [200, 201].includes(r.status),
          });
        }
        
        errorRate.add(listResponse.status !== 200);
      });
      
      sleep(1);
      
      // Grupo de prueba: Gestión de turnos
      group('Shift Management', function() {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        
        // Listar turnos
        const shiftsResponse = http.get(`${BASE_URL}/api/shifts`, { headers });
        check(shiftsResponse, {
          'shifts list loads': (r) => r.status === 200,
          'shifts response time ok': (r) => r.timings.duration < 1000,
        });
        
        // Crear turno (probabilidad menor)
        if (Math.random() < 0.2) {
          const shift = {
            name: `Turno ${Date.now()}`,
            startTime: '09:00',
            endTime: '17:00',
            date: new Date().toISOString().split('T')[0],
          };
          
          const createShiftResponse = http.post(`${BASE_URL}/api/shifts`, shift, { headers });
          check(createShiftResponse, {
            'shift creation succeeds': (r) => [200, 201].includes(r.status),
          });
        }
        
        errorRate.add(shiftsResponse.status !== 200);
      });
    }
  });
  
  sleep(2);
}

// Función de configuración (ejecutada una vez)
export function setup() {
  console.log('🚀 Iniciando pruebas de rendimiento WAOK-Schedule');
  console.log(`📊 URL Base: ${BASE_URL}`);
  console.log('⏱️  Duración estimada: ~15 minutos');
  
  // Verificar que la aplicación esté corriendo
  const response = http.get(BASE_URL);
  if (response.status !== 200) {
    throw new Error(`❌ Aplicación no disponible en ${BASE_URL}`);
  }
  
  console.log('✅ Aplicación disponible, iniciando pruebas...');
  return { baseUrl: BASE_URL };
}

// Función de limpieza (ejecutada una vez al final)
export function teardown(data) {
  console.log('🏁 Pruebas de rendimiento completadas');
  console.log('📈 Revisa el reporte generado para métricas detalladas');
}

// Función para agrupar operaciones relacionadas
function group(name, fn) {
  console.log(`🔄 Ejecutando: ${name}`);
  return fn();
}