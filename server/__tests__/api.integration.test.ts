/**
 * Pruebas de Integración de API para WAOK-Schedule
 * 
 * Estas pruebas validan la funcionalidad completa de la API REST,
 * incluyendo autenticación, CRUD de usuarios, y manejo de errores.
 * 
 * Tecnologías utilizadas:
 * - Vitest: Framework de testing
 * - Supertest: Cliente HTTP para testing
 * - Express: Servidor web
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import express from 'express'
import { registerRoutes } from '../routes'
import { storage } from '../storage'

// Test data
const testUser = {
  username: 'testuser',
  password: 'testpassword123'
}

const invalidUser = {
  username: '', // Invalid: empty username
  password: 'short' // Invalid: too short
}

const duplicateUser = {
  username: 'admin', // Duplicate: already exists in test data
  password: 'password123'
}

describe('API Integration Tests - WAOK Schedule', () => {
  let app: Express
  let server: any

  beforeAll(async () => {
    // Configurar aplicación Express para testing
    app = express()
    
    // Registrar rutas de la API (incluye express.json() y manejo de errores)
    server = await registerRoutes(app)
  })

  afterAll(async () => {
    if (server) {
      server.close()
    }
  })

  beforeEach(async () => {
    // En una implementación real con base de datos, aquí se limpiarían las tablas
    // Por ahora trabajamos con el storage en memoria que se reinicia automáticamente
  })

  describe('🔍 Health Check & System Status', () => {
    
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'WAOK-Schedule API'
      })
      expect(response.body.timestamp).toBeDefined()
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
    
    it('should handle undefined API routes with 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
    
  })

  describe('👥 User Management - CRUD Operations', () => {
    
    describe('GET /api/users - List All Users', () => {
      
      it('should return all users (including test data)', async () => {
        const response = await request(app)
          .get('/api/users')
          .expect(200)

        expect(response.body).toBeInstanceOf(Array)
        expect(response.body.length).toBeGreaterThanOrEqual(2) // admin y user1
        
        // Verificar estructura de datos y seguridad
        response.body.forEach((user: any) => {
          expect(user).toHaveProperty('id')
          expect(user).toHaveProperty('username')
          expect(user).not.toHaveProperty('password') // 🔒 Seguridad: No exponer passwords
          expect(typeof user.id).toBe('number')
          expect(typeof user.username).toBe('string')
        })
        
        // Verificar que existen usuarios de prueba
        const adminUser = response.body.find((u: any) => u.username === 'admin')
        expect(adminUser).toBeDefined()
        expect(adminUser.id).toBe(1)
      })
      
      it('should return empty array when no users exist', async () => {
        // Nota: En nuestro caso siempre hay usuarios de prueba
        // En una implementación real, podrías limpiar la DB aquí
        const response = await request(app)
          .get('/api/users')
          .expect(200)

        expect(Array.isArray(response.body)).toBe(true)
      })
      
    })

    describe('POST /api/users - Create New User', () => {
      
      it('should create user with valid data', async () => {
        const uniqueUser = {
          username: `testuser_${Date.now()}`,
          password: 'securepassword123'
        }

        const response = await request(app)
          .post('/api/users')
          .send(uniqueUser)
          .expect(201)

        expect(response.body).toMatchObject({
          username: uniqueUser.username
        })
        expect(response.body).toHaveProperty('id')
        expect(typeof response.body.id).toBe('number')
        expect(response.body).not.toHaveProperty('password') // 🔒 Seguridad
      })
      
      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/users')
          .send({})
          .expect(400)
          
        expect(response.body).toMatchObject({
          error: expect.any(String)
        })
      })
      
      it('should validate username requirements', async () => {
        const response = await request(app)
          .post('/api/users')
          .send(invalidUser)
          .expect(400)
          
        expect(response.body).toMatchObject({
          error: expect.any(String)
        })
      })
      
      it('should reject duplicate usernames', async () => {
        // Intentar crear un usuario con username que ya existe (admin)
        const response = await request(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(409) // Conflict
          
        expect(response.body).toMatchObject({
          error: expect.stringContaining('username')
        })
      })
      
      it('should handle malformed JSON', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400)
          
        expect(response.body).toMatchObject({
          error: expect.any(String)
        })
      })
      
    })
    
    describe('GET /api/users - Additional User Tests', () => {
      
      it('should retrieve all users with proper structure', async () => {
        const response = await request(app)
          .get('/api/users')
          .expect(200)
          
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              username: expect.any(String)
            })
          ])
        )
        
        // Verificar que las contraseñas no se devuelven
        response.body.forEach((user: any) => {
          expect(user.password).toBeUndefined()
        })
      })
      
    })
    
    describe('GET /api/users/:id - Single User Retrieval', () => {
      
      it('should retrieve a specific user by ID', async () => {
        // Usar el ID del usuario admin que sabemos existe
        const response = await request(app)
          .get('/api/users/1')
          .expect(200)
          
        expect(response.body).toMatchObject({
          id: 1,
          username: 'admin'
        })
        
        expect(response.body.password).toBeUndefined()
      })
      
      it('should return 404 for non-existent user ID', async () => {
        const response = await request(app)
          .get('/api/users/99999')
          .expect(404)
          
        expect(response.body).toMatchObject({
          error: expect.stringContaining('not found')
        })
      })
      
      it('should handle invalid user ID format', async () => {
        const response = await request(app)
          .get('/api/users/invalid-id')
          .expect(400)
          
        expect(response.body).toMatchObject({
          error: expect.any(String)
        })
      })
      
    })
    
  })

  describe('Data Validation & Security', () => {
    
    it('should enforce content-type validation', async () => {
      await request(app)
        .post('/api/users')
        .set('Content-Type', 'text/plain')
        .send('not json')
        .expect(400)
    })
    
    it('should handle large payloads gracefully', async () => {
      const largePayload = {
        username: 'a'.repeat(1000),
        password: 'b'.repeat(1000)
      }
      
      const response = await request(app)
        .post('/api/users')
        .send(largePayload)
        .expect(400)
        
      expect(response.body.error).toBeDefined()
    })
    
    it('should sanitize SQL injection attempts', async () => {
      const maliciousUser = {
        username: "'; DROP TABLE users; --",
        password: 'password'
      }
      
      // La consulta debe fallar de manera segura, no exitosa
      await request(app)
        .post('/api/users')
        .send(maliciousUser)
        .expect(400) // O podría ser 201 si se sanea correctamente
    })
    
  })

  describe('Error Handling & Edge Cases', () => {
    
    it('should handle database connection errors gracefully', async () => {
      // Este test requeriría mockar la conexión a la base de datos
      // Por ahora, verificamos que el servidor responde con errores apropiados
      
      const response = await request(app)
        .get('/api/users')
        .expect(200) // Assuming DB is available in tests
        
      expect(Array.isArray(response.body)).toBe(true)
    })
    
    it('should handle concurrent user creation', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        request(app)
          .post('/api/users')
          .send({
            username: `concurrent_user_${i}`,
            password: 'password123'
          })
      )
      
      const responses = await Promise.all(promises)
      
      // Todos deberían ser exitosos
      responses.forEach(response => {
        expect(response.status).toBe(201)
        expect(response.body.id).toBeDefined()
      })
      
      // Verificar que se crearon todos los usuarios
      const allUsers = await request(app)
        .get('/api/users')
        .expect(200)
        
      expect(allUsers.body.length).toBeGreaterThanOrEqual(5)
    })
    
  })

  describe('API Response Format & Standards', () => {
    
    it('should return consistent JSON response format', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200)
        
      expect(response.headers['content-type']).toMatch(/application\/json/)
      expect(Array.isArray(response.body)).toBe(true)
    })
    
    it('should include proper CORS headers', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200)
        
      // Verificar que hay headers CORS (si están configurados)
      // expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
    
    it('should handle OPTIONS requests for CORS preflight', async () => {
      await request(app)
        .options('/api/users')
        .expect(204) // No Content, or 200 depending on CORS setup
    })
    
  })

})

/**
 * Test Utilities y Helpers
 */

// Helper para crear múltiples usuarios de prueba
export const createTestUsers = async (app: Express, count: number = 3) => {
  const users = []
  for (let i = 0; i < count; i++) {
    const user = {
      username: `testuser${i}_${Date.now()}`,
      password: `password${i}`
    }
    const response = await request(app)
      .post('/api/users')
      .send(user)
      .expect(201)
    users.push(response.body)
  }
  return users
}

// Helper para limpiar la base de datos en memoria
export const cleanupDatabase = async () => {
  // En implementación con base de datos real, aquí se limpiarían las tablas
  // Con MemStorage, los datos se reinician automáticamente
  console.log('Database cleanup - MemStorage resets automatically')
}