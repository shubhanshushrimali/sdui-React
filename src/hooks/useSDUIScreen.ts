import { useEffect, useState, useCallback } from 'react';
import { SDUIScreen } from '../sdui/types';
import { fetchSDUIScreen } from '../services/schemaService';
import { useAppStore } from '../store/useAppStore';
import { validateSDUIScreen } from '../sdui/SchemaValidator';

export function useSDUIScreen(screenId: string) {
  const [screen, setScreen] = useState<SDUIScreen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const liveCustomSchema = useAppStore((state) => state.liveCustomSchema);

  const loadScreen = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If live custom schema is active in dev mode, try parsing that first
    if (liveCustomSchema && screenId === 'home') {
      try {
        const parsed = JSON.parse(liveCustomSchema);
        const validation = validateSDUIScreen(parsed);
        if (validation.success) {
          setScreen(validation.data as SDUIScreen);
          setLoading(false);
          return;
        }
      } catch (e: any) {
        console.warn('[SDUI] Live schema parse error:', e.message);
      }
    }

    try {
      const data = await fetchSDUIScreen(screenId);
      setScreen(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load screen');
    } finally {
      setLoading(false);
    }
  }, [screenId, liveCustomSchema]);

  useEffect(() => {
    loadScreen();
  }, [loadScreen]);

  return {
    screen,
    loading,
    error,
    refresh: loadScreen,
  };
}
