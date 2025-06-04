import express from 'express';
import cors from 'cors';

// Crear aplicación Express
const app = express();

// Configurar CORS
app.use(cors());

// Configurar middleware OPTIONS
app.options('*', cors());

// Configurar express.json con límite
app.use(express.json({ limit: '10mb' }));

// Simular el comportamiento del manejador de errores de routes.ts
app.use((err, req, res, next) => {
  console.log('[ERROR MIDDLEWARE] Error detectado:', {
    name: err.name,
    message: err.message,
    type: err.type,
    status: err.status,
    statusCode: err.statusCode
  });

  // Detectar errores de parsing JSON
  if (err instanceof SyntaxError && err.status === 400) {
    console.log('[ERROR MIDDLEWARE] SyntaxError con estado 400 detectado');
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  
  if (err.type === 'entity.parse.failed') {
    console.log('[ERROR MIDDLEWARE] Error entity.parse.failed detectado');
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  
  if (err.message && err.message.includes('JSON') && err.status === 400) {
    console.log('[ERROR MIDDLEWARE] Error JSON con estado 400 detectado');
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  // Error genérico
  console.log('[ERROR MIDDLEWARE] Error genérico - enviando 500');
  res.status(500).json({ error: 'Internal Server Error' });
});

// Endpoints básicos para pruebas
app.get('/api/users', (req, res) => {
  res.json([]);
});

app.post('/api/users', (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

// Función de prueba
async function testMalformedJSON() {
  try {
    const server = app.listen(0); // Puerto automático
    const port = server.address().port;
    console.log(`[TEST] Servidor iniciado en puerto ${port}`);

    // Realizar petición con JSON inválido
    const response = await fetch(`http://localhost:${port}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{"invalid":json}' // JSON inválido
    });

    console.log(`[TEST] Respuesta recibida:`);
    console.log(`[TEST] Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`[TEST] Body: ${responseText}`);

    // Verificar el resultado
    if (response.status === 400) {
      console.log('[TEST] ✅ PRUEBA EXITOSA: Se recibió el estado 400 esperado');
    } else {
      console.log(`[TEST] ❌ PRUEBA FALLIDA: Se esperaba 400, se recibió ${response.status}`);
    }

    server.close();
    return response.status === 400;
  } catch (error) {
    console.error('[TEST] Error durante la prueba:', error);
    return false;
  }
}

// Ejecutar la prueba
testMalformedJSON().then(success => {
  console.log(`[TEST] Resultado final: ${success ? 'EXITOSO' : 'FALLIDO'}`);
  process.exit(success ? 0 : 1);
});