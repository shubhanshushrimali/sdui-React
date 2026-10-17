import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { acceptScreen, trackSDUIEvent, type SDUIScreen } from '@sdui/react';
import { fetchSDUIScreen } from '../services/schemaService';
import { useAppStore } from '../store/useAppStore';
import { validateSDUIScreen } from '../../packages/sdui/src/sdui/SchemaValidator';
import homeSchema from '../schemas/home.json';
import exploreSchema from '../schemas/explore.json';

const LOCAL_FALLBACKS: Record<string, SDUIScreen> = {
  home: homeSchema as SDUIScreen,
  explore: exploreSchema as SDUIScreen,
};

export function useSDUIScreen(screenId: string) {
  // Initialize synchronously with local fallback for instant first paint & SSR support
  const [screen, setScreen] = useState<SDUIScreen | null>(() => {
    return LOCAL_FALLBACKS[screenId] || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const liveCustomSchema = useAppStore((state) => state.liveCustomSchema);

  const liveScreen = useMemo(() => {
    if (!liveCustomSchema || screenId !== 'home') return null;
    try {
      const raw = liveCustomSchema;
      const validation = validateSDUIScreen(JSON.parse(raw));
      if (!validation.success) {
        trackSDUIEvent({
          kind: 'validation',
          name: screenId,
          properties: { ok: false, reason: 'invalid schema' },
        });
        return null;
      }
      const screen = validation.data as SDUIScreen;
      const guard = acceptScreen(screen, raw.length);
      if (!guard.ok) {
        trackSDUIEvent({
          kind: 'validation',
          name: screenId,
          properties: { ok: false, reason: guard.reason },
        });
        console.warn(`[SDUI] Live schema blocked: ${guard.reason}`);
        return null;
      }
      trackSDUIEvent({ kind: 'validation', name: screenId, properties: { ok: true, source: 'live' } });
      return screen;
    } catch (parseError) {
      trackSDUIEvent({
        kind: 'validation',
        name: screenId,
        properties: { ok: false, reason: (parseError as Error).message },
      });
      console.warn('[SDUI] Live schema parse error:', (parseError as Error).message);
      return null;
    }
  }, [liveCustomSchema, screenId]);

  const refresh = useCallback(() => {
    if (liveCustomSchema && screenId === 'home') return;
    const request = ++requestSeq.current;
    setLoading(true);
    setError(null);
    void fetchSDUIScreen(screenId, {
      forceNetwork: true,
      onUpdate: (next) => {
        if (requestSeq.current === request) setScreen(next);
      },
    })
      .then((data) => {
        if (requestSeq.current !== request) return;
        if (data) setScreen(data);
        setError(null);
      })
      .catch((error: Error) => {
        if (requestSeq.current !== request) return;
        setError(error?.message || 'Failed to load screen');
      })
      .finally(() => {
        if (requestSeq.current === request) setLoading(false);
      });
  }, [screenId, liveCustomSchema]);

  useEffect(() => {
    if (liveCustomSchema && screenId === 'home') return;
    const request = ++requestSeq.current;
    let active = true;
    void fetchSDUIScreen(screenId, {
      onUpdate: (next) => {
        if (active && requestSeq.current === request) setScreen(next);
      },
    })
      .then((data) => {
        if (!active || requestSeq.current !== request) return;
        if (data) setScreen(data);
        setError(null);
      })
      .catch((error: Error) => {
        if (!active || requestSeq.current !== request) return;
        setError(error?.message || 'Failed to load screen');
      });
    return () => {
      active = false;
    };
  }, [screenId, liveCustomSchema]);

  return {
    screen: liveScreen ?? screen,
    loading,
    error,
    refresh,
  };
}
