import { useEffect, useState, useCallback } from 'react';
import { SDUIScreen } from '../sdui/types';
import { fetchSDUIScreen } from '../services/schemaService';
import { useAppStore } from '../store/useAppStore';
import { validateSDUIScreen } from '../sdui/SchemaValidator';
import homeSchema from '../schemas/home.json';
import exploreSchema from '../schemas/explore.json';

const LOCAL_FALLBACKS: Record<string, any> = {
  home: homeSchema,
  explore: exploreSchema,
};

export function useSDUIScreen(screenId: string) {
  // Initialize synchronously with local fallback for instant first paint & SSR support
  const [screen, setScreen] = useState<SDUIScreen | null>(() => {
    return (LOCAL_FALLBACKS[screenId] as SDUIScreen) || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const liveCustomSchema = useAppStore((state) => state.liveCustomSchema);

  const loadScreen = useCallback(async () => {
    // If live custom schema is active in dev mode, use that
    if (liveCustomSchema && screenId === 'home') {
      try {
        const parsed = JSON.parse(liveCustomSchema);
        const validation = validateSDUIScreen(parsed);
        if (validation.success) {
          setScreen(validation.data as SDUIScreen);
          return;
        }
      } catch (e: any) {
        console.warn('[SDUI] Live schema parse error:', e.message);
      }
    }

    try {
      const data = await fetchSDUIScreen(screenId);
      if (data) {
        setScreen(data);
      }
    } catch (err: any) {
      // If error occurs, keep existing fallback screen
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
