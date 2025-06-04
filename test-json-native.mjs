import http from 'http';
import { URL } from 'url';

// Simular el comportamiento de parsing JSON de Express
function parseJSON(body) {
  if (!body || body.trim() === '') {
    return {};
  }
  
  try {
    return JSON.parse(body);
  } catch (error) {
    // Simular el error que genera Express
    const syntaxError = new SyntaxError('Unexpected token j in JSON at position 10');
    syntaxError.status = 400;
    syntaxError.statusCode = 400;
    syntaxError.type = 'entity.parse.failed';
    syntaxError.body = body;
    throw syntaxError;
  }
}

// Crear servidor HTTP básico que simule Express
const server = http.createServer((req, res) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/api/users' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log(`[SERVER] Body recibido: ${body}`);
      
      try {
        // Intentar parsear JSON (esto debería fallar con JSON inválido)
        const parsedBody = parseJSON(body);
        console.log('[SERVER] JSON parseado correctamente:', parsedBody);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 1, ...parsedBody }));
      } catch (error) {
        console.log('[SERVER] Error parseando JSON:', {
          name: error.name,
          message: error.message,
          status: error.status,
          type: error.type
        });
        
        // Aplicar la misma lógica del manejador de errores de routes.ts
        if (error instanceof SyntaxError && error.status === 400) {
          console.log('[SERVER] SyntaxError con estado 400 detectado - respondiendo 400');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON format' }));
          return;
        }
        
        if (error.type === 'entity.parse.failed') {
          console.log('[SERVER] Error entity.parse.failed detectado - respondiendo 400');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON format' }));
          return;
        }
        
        if (error.message && error.message.includes('JSON') && error.status === 400) {
          console.log('[SERVER] Error JSON con estado 400 detectado - respondiendo 400');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON format' }));
          return;
        }
        
        // Error genérico
        console.log('[SERVER] Error genérico - respondiendo 500');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  } else {
    // 404 para otras rutas
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Función de prueba
async function testMalformedJSON() {
  return new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      console.log(`[TEST] Servidor iniciado en puerto ${port}`);
      
      // Realizar petición HTTP con JSON inválido
      const postData = '{"invalid":json}'; // JSON inválido
      
      const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/users',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, (res) => {
        console.log(`[TEST] Respuesta recibida:`);
        console.log(`[TEST] Status: ${res.statusCode} ${res.statusMessage}`);
        
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        
        res.on('end', () => {
          console.log(`[TEST] Body: ${responseBody}`);
          
          // Verificar el resultado
          if (res.statusCode === 400) {
            console.log('[TEST] ✅ PRUEBA EXITOSA: Se recibió el estado 400 esperado');
            server.close(() => resolve(true));
          } else {
            console.log(`[TEST] ❌ PRUEBA FALLIDA: Se esperaba 400, se recibió ${res.statusCode}`);
            server.close(() => resolve(false));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('[TEST] Error en la petición:', error);
        server.close(() => resolve(false));
      });
      
      req.write(postData);
      req.end();
    });
  });
}

// Ejecutar la prueba
testMalformedJSON().then(success => {
  console.log(`[TEST] Resultado final: ${success ? 'EXITOSO' : 'FALLIDO'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('[TEST] Error ejecutando la prueba:', error);
  process.exit(1);
});