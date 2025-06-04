import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

  // Handle preflight OPTIONS requests
  app.options('*', (req, res) => {
    res.status(204).end();
  });

  // JSON parsing middleware
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "WAOK-Schedule API"
    });
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove password from response for security
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }

      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      // Validate content-type
      if (req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
      }
      // Validate payload size
      const maxUsernameLength = 50;
      const maxPasswordLength = 100;
      
      if (req.body.username && req.body.username.length > maxUsernameLength) {
        return res.status(400).json({ 
          error: "Username too long",
          maxLength: maxUsernameLength 
        });
      }
      
      if (req.body.password && req.body.password.length > maxPasswordLength) {
        return res.status(400).json({ 
          error: "Password too long",
          maxLength: maxPasswordLength 
        });
      }
      
      // Check for potentially malicious content
      if (req.body.username && /[';"\-\-]|DROP|DELETE|INSERT|UPDATE|SELECT/i.test(req.body.username)) {
        return res.status(400).json({ 
          error: "Invalid characters in username" 
        });
      }
      
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid user data",
          details: validationResult.error.errors
        });
      }

      const userData = validationResult.data;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ 
          error: "User with this username already exists" 
        });
      }

      // Create user
      const newUser = await storage.insertUser(userData);
      
      // Remove password from response
      const { password, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Handle 404 for undefined routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Global error handler - handles JSON parsing errors and others
  app.use((error: any, req: any, res: any, next: any) => {
    console.log('=== ERROR MIDDLEWARE TRIGGERED ===');
    console.log('Error type:', error.type);
    console.log('Error message:', error.message);
    console.log('Error status:', error.status);
    console.log('Error constructor:', error.constructor.name);
    console.log('Error instanceof SyntaxError:', error instanceof SyntaxError);
    console.log('Has body property:', 'body' in error);
    console.log('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Handle JSON parsing errors - more comprehensive check
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      console.log('Responding with 400 for SyntaxError JSON parsing error');
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    if (error.type === 'entity.parse.failed') {
      console.log('Responding with 400 for entity.parse.failed error');
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    // Additional check for JSON parsing errors from express.json()
    if (error.message && error.message.toLowerCase().includes('json') && error.status === 400) {
      console.log('Responding with 400 for JSON message error');
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    console.log('Responding with 500 for unhandled error');
     res.status(500).json({ error: "Internal server error" });
   });

  const httpServer = createServer(app);

  return httpServer;
}
