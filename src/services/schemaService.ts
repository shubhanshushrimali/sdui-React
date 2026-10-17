import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { acceptScreen, type SDUIScreen } from '@sdui/react';
import { validateSDUIScreen } from '../../packages/sdui/src/sdui/SchemaValidator';
import { decideCache, isCacheFresh, type CachePolicyName } from '../../packages/sdui/src/sdui/cachePolicy';

// Import local bundled fallback schemas
import homeSchema from '../schemas/home.json';
import exploreSchema from '../schemas/explore.json';

const LOCAL_FALLBACKS: Record<string, unknown> = {
  home: homeSchema,
  explore: exploreSchema,
};

const CACHE_PREFIX = '@sdui_screen_cache_';
const CACHE_TIME_PREFIX = '@sdui_screen_time_';

export interface FetchSDUIScreenOptions {
  /** Skip cache short-circuits and ask the network. Used by pull-to-refresh. */
  forceNetwork?: boolean;
  /** Called when a stale screen is refreshed in the background. */
  onUpdate?: (screen: SDUIScreen) => void;
}

interface CachedScreen {
  screen: SDUIScreen;
  ageMs: number;
}

function policyOf(screen: SDUIScreen | undefined): CachePolicyName {
  return screen?.metadata?.cachePolicy ?? 'stale-while-revalidate';
}

function screensEqual(left: SDUIScreen, right: SDUIScreen): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function readCachedScreen(screenId: string): Promise<CachedScreen | null> {
  const cacheKey = `${CACHE_PREFIX}${screenId}`;
  const cacheTimeKey = `${CACHE_TIME_PREFIX}${screenId}`;

  try {
    const [cachedStr, cachedTime] = await Promise.all([
      AsyncStorage.getItem(cacheKey),
      AsyncStorage.getItem(cacheTimeKey),
    ]);
    if (!cachedStr) return null;

    const parsed = JSON.parse(cachedStr);
    const validation = validateSDUIScreen(parsed);
    if (!validation.success) return null;
    const guard = acceptScreen(validation.data as SDUIScreen, cachedStr.length);
    if (!guard.ok) {
      console.warn(`[SDUI] Cached schema for "${screenId}" blocked: ${guard.reason}`);
      return null;
    }

    const savedAt = Number(cachedTime);
    const ageMs = Number.isFinite(savedAt) ? Date.now() - savedAt : Number.POSITIVE_INFINITY;
    return { screen: validation.data as SDUIScreen, ageMs };
  } catch (cacheErr) {
    console.warn(`[SDUI] Cache read error for "${screenId}":`, cacheErr);
    return null;
  }
}

async function persistCache(screenId: string, screen: SDUIScreen): Promise<void> {
  const cacheKey = `${CACHE_PREFIX}${screenId}`;
  const cacheTimeKey = `${CACHE_TIME_PREFIX}${screenId}`;

  if (policyOf(screen) === 'no-cache') {
    await Promise.all([
      AsyncStorage.removeItem(cacheKey),
      AsyncStorage.removeItem(cacheTimeKey),
    ]).catch(() => {});
    return;
  }

  await Promise.all([
    AsyncStorage.setItem(cacheKey, JSON.stringify(screen)),
    AsyncStorage.setItem(cacheTimeKey, Date.now().toString()),
  ]).catch(() => {});
}

async function fetchFromNetwork(screenId: string): Promise<SDUIScreen | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const snapshot = await getDoc(doc(db, 'sdui_screens', screenId));
    if (!snapshot.exists()) return null;

    const validation = validateSDUIScreen(snapshot.data());
    if (!validation.success) {
      console.warn(`[SDUI] Firestore schema for "${screenId}" failed validation:`, validation.error);
      return null;
    }

    const screen = validation.data as SDUIScreen;
    const guard = acceptScreen(screen);
    if (!guard.ok) {
      console.warn(`[SDUI] Firestore schema for "${screenId}" blocked: ${guard.reason}`);
      return null;
    }

    return screen;
  } catch (firebaseErr) {
    console.warn(
      `[SDUI] Firebase fetch failed for "${screenId}", using cache/fallback:`,
      (firebaseErr as Error).message
    );
    return null;
  }
}

function bundledScreen(screenId: string): SDUIScreen | null {
  const fallback = LOCAL_FALLBACKS[screenId];
  if (!fallback) return null;
  const validation = validateSDUIScreen(fallback);
  if (!validation.success) return null;
  const screen = validation.data as SDUIScreen;
  const guard = acceptScreen(screen);
  return guard.ok ? screen : null;
}

function emptyScreen(screenId: string): SDUIScreen {
  return {
    screenId,
    version: 1,
    metadata: { title: 'Screen', cachePolicy: 'no-cache' },
    root: {
      type: 'View',
      style: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' },
      children: [
        {
          type: 'Text',
          props: { text: `No SDUI Schema available for "${screenId}"` },
          style: { color: '#F43F5E', fontSize: 16, fontWeight: '700' },
        },
      ],
    },
  };
}

async function revalidate(
  screenId: string,
  previous: SDUIScreen,
  onUpdate?: (screen: SDUIScreen) => void
): Promise<void> {
  const fresh = await fetchFromNetwork(screenId);
  if (!fresh) return;
  await persistCache(screenId, fresh);
  if (!screensEqual(previous, fresh)) onUpdate?.(fresh);
}

export async function fetchSDUIScreen(
  screenId: string,
  options?: FetchSDUIScreenOptions
): Promise<SDUIScreen> {
  const cached = await readCachedScreen(screenId);
  const decision = decideCache({
    policy: policyOf(cached?.screen),
    hasCache: cached != null,
    fresh: cached ? isCacheFresh(cached.screen.metadata?.cacheTTL, cached.ageMs) : false,
    forceNetwork: options?.forceNetwork,
  });

  if (decision.action === 'use-cache' && cached) {
    if (decision.revalidate) {
      void revalidate(screenId, cached.screen, options?.onUpdate);
    }
    return cached.screen;
  }

  const fresh = await fetchFromNetwork(screenId);
  if (fresh) {
    await persistCache(screenId, fresh);
    return fresh;
  }

  if (decision.action === 'fetch-network' && decision.keepStaleOnFailure && cached) {
    return cached.screen;
  }

  return bundledScreen(screenId) ?? emptyScreen(screenId);
}
