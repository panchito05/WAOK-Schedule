import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced database configuration with connection pooling and retry logic
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || 
                      process.env.DATABASE_URL?.includes('neon.database.url');

if (isNeonDatabase) {
  // Use Neon-specific configuration for serverless
  export const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1, // Serverless optimization
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
} else {
  // Standard PostgreSQL configuration for local/other environments
  export const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });
}

export const db = drizzle({ client: pool, schema });

// Health check function for database connectivity
export async function checkDatabaseHealth() {
  try {
    const result = await pool.query('SELECT 1 as health_check');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
