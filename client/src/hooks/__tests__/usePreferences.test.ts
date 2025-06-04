import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferences } from '../usePreferences';

describe('usePreferences Hook', () => {
  describe('Inicialización', () => {
    it('debe inicializar con preferencias vacías cuando no se proporcionan', () => {
      const { result } = renderHook(() => usePreferences([]));
      
      expect(result.current.preferences).toEqual([]);
      expect(result.current.isPreferenceUsed(1)).toBe(false);
      expect(result.current.isPreferenceUsed(2)).toBe(false);
      expect(result.current.isPreferenceUsed(3)).toBe(false);
    });

    it('debe inicializar con las preferencias proporcionadas', () => {
      const initialPrefs = [1, null, 2];
      const { result } = renderHook(() => usePreferences(initialPrefs));
      
      expect(result.current.preferences).toEqual([1, null, 2]);
      expect(result.current.isPreferenceUsed(1)).toBe(true);
      expect(result.current.isPreferenceUsed(2)).toBe(true);
      expect(result.current.isPreferenceUsed(3)).toBe(false);
    });

    it('debe manejar correctamente preferencias con valores null', () => {
      const initialPrefs = [null, null, null];
      const { result } = renderHook(() => usePreferences(initialPrefs));
      
      expect(result.current.preferences).toEqual([null, null, null]);
      expect(result.current.isPreferenceUsed(1)).toBe(false);
      expect(result.current.isPreferenceUsed(2)).toBe(false);
      expect(result.current.isPreferenceUsed(3)).toBe(false);
    });
  });

  describe('Actualización de preferencias', () => {
    it('debe permitir establecer una nueva preferencia', () => {
      const { result } = renderHook(() => usePreferences([null, null, null]));
      
      act(() => {
        result.current.updatePreference(0, 1);
      });
      
      expect(result.current.preferences[0]).toBe(1);
      expect(result.current.isPreferenceUsed(1)).toBe(true);
    });

    it('debe permitir cambiar una preferencia existente', () => {
      const { result } = renderHook(() => usePreferences([1, null, null]));
      
      act(() => {
        result.current.updatePreference(0, 2);
      });
      
      expect(result.current.preferences[0]).toBe(2);
      expect(result.current.isPreferenceUsed(1)).toBe(false);
      expect(result.current.isPreferenceUsed(2)).toBe(true);
    });

    it('debe permitir quitar una preferencia (establecer a null)', () => {
      const { result } = renderHook(() => usePreferences([1, 2, null]));
      
      act(() => {
        result.current.updatePreference(0, null);
      });
      
      expect(result.current.preferences[0]).toBe(null);
      expect(result.current.isPreferenceUsed(1)).toBe(false);
      expect(result.current.isPreferenceUsed(2)).toBe(true);
    });

    it('debe retornar las nuevas preferencias después de la actualización', () => {
      const { result } = renderHook(() => usePreferences([null, null, null]));
      
      let returnedPreferences: (number | null)[];
      act(() => {
        returnedPreferences = result.current.updatePreference(0, 1);
      });
      
      expect(returnedPreferences!).toEqual([1, null, null]);
      expect(result.current.preferences).toEqual([1, null, null]);
    });
  });

  describe('Casos extremos - Deselección total', () => {
    it('debe permitir deseleccionar todas las preferencias', () => {
      const { result } = renderHook(() => usePreferences([1, 2, 3]));
      
      // Deseleccionar todas las preferencias una por una
      act(() => {
        result.current.updatePreference(0, null);
      });
      act(() => {
        result.current.updatePreference(1, null);
      });
      act(() => {
        result.current.updatePreference(2, null);
      });
      
      expect(result.current.preferences).toEqual([null, null, null]);
      expect(result.current.isPreferenceUsed(1)).toBe(false);
      expect(result.current.isPreferenceUsed(2)).toBe(false);
      expect(result.current.isPreferenceUsed(3)).toBe(false);
    });

    it('debe mantener la integridad después de múltiples cambios', () => {
      const { result } = renderHook(() => usePreferences([null, null, null]));
      
      // Secuencia de cambios compleja
      act(() => {
        result.current.updatePreference(0, 1);
      });
      act(() => {
        result.current.updatePreference(1, 2);
      });
      act(() => {
        result.current.updatePreference(2, 3);
      });
      act(() => {
        result.current.updatePreference(0, null); // Quitar preferencia 1
      });
      act(() => {
        result.current.updatePreference(0, 1); // Volver a poner preferencia 1
      });
      
      expect(result.current.preferences).toEqual([1, 2, 3]);
      expect(result.current.isPreferenceUsed(1)).toBe(true);
      expect(result.current.isPreferenceUsed(2)).toBe(true);
      expect(result.current.isPreferenceUsed(3)).toBe(true);
    });
  });

  describe('Validación de preferencias usadas', () => {
    it('debe prevenir el uso de preferencias duplicadas', () => {
      const { result } = renderHook(() => usePreferences([1, null, null]));
      
      expect(result.current.isPreferenceUsed(1)).toBe(true);
      expect(result.current.isPreferenceUsed(2)).toBe(false);
      expect(result.current.isPreferenceUsed(3)).toBe(false);
    });

    it('debe actualizar correctamente las preferencias usadas al cambiar', () => {
      const { result } = renderHook(() => usePreferences([1, 2, null]));
      
      // Cambiar preferencia 1 por 3
      act(() => {
        result.current.updatePreference(0, 3);
      });
      
      expect(result.current.isPreferenceUsed(1)).toBe(false);
      expect(result.current.isPreferenceUsed(2)).toBe(true);
      expect(result.current.isPreferenceUsed(3)).toBe(true);
    });
  });
});