import express from 'express';
import request from 'supertest';

// Crear una app de prueba simple (replicando la estructura del servidor)
const app = express();

// Función para registrar rutas (similar a registerRoutes)
async function setupApp(app) {
  // CORS middleware (exacto como en routes.ts)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

  // Handle preflight OPTIONS requests (exacto como en routes.ts)
  app.options('*', (req, res) => {
    res.status(204).end();
  });

  // JSON parsing middleware
  app.use(express.json({ limit: '10mb' }));
  
  // JSON parsing error handler - must be placed immediately after express.json()
  app.use((err, req, res, next) => {
    console.log('\n=== ERROR HANDLER CALLED ===');
    console.log('Error message:', err?.message || 'No message');
    console.log('Error type:', err?.constructor?.name || 'Unknown');
    console.log('Error status:', err?.status || 'No status');
    console.log('Error statusCode:', err?.statusCode || 'No statusCode');
    console.log('Error type property:', err?.type || 'No type');
    console.log('Has body property:', 'body' in err);
    console.log('Is SyntaxError:', err instanceof SyntaxError);
    console.log('Status equals 400:', err.status === 400);
    console.log('==============================\n');
    
    // Handle JSON parsing errors based on Express.js documentation
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.log('Handling JSON parsing error');
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    // Handle entity.parse.failed errors
    if (err.type === 'entity.parse.failed') {
      console.log('Handling entity.parse.failed error');
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    next(err);
  });

  // Test endpoint similar a /api/users
  app.post('/api/users', (req, res) => {
    res.json({ success: true, body: req.body });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.log('\n=== GLOBAL ERROR HANDLER ===');
    console.log('Unhandled error:', err.message);
    console.log('=============================\n');
    res.status(500).json({ error: 'Internal server error' });
  });
}

// Función de prueba
async function testJSONError() {
  console.log('Testing JSON error handling...');
  
  // Setup app like the server does
  await setupApp(app);
  
  try {
    const response = await request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');
    
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
    if (response.status === 400) {
      console.log('✅ TEST PASSED: JSON error handled correctly');
    } else {
      console.log('❌ TEST FAILED: Expected 400, got', response.status);
    }
  } catch (error) {
    console.log('❌ TEST ERROR:', error.message);
  }
}

// Ejecutar la prueba
testJSONError();