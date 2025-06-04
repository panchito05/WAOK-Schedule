/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    // Configuración específica para pruebas de integración
    testTimeout: 30000, // 30 segundos para pruebas de API
    hookTimeout: 10000, // 10 segundos para hooks de setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/**',
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'server/**/*.{test,spec}.{js,ts}', // Incluir pruebas del servidor
      'shared/**/*.{test,spec}.{js,ts}' // Incluir pruebas compartidas
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'client/src/tests/e2e/**', // Excluir pruebas E2E de Playwright
    ],
    // Configuración para pruebas de base de datos
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true // Evitar conflictos de DB en pruebas concurrentes
      }
    }
  },
});