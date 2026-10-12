import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SDUIScreen } from '../sdui/types';
import { validateSDUIScreen } from '../sdui/SchemaValidator';

// Import local bundled fallback schemas
import homeSchema from '../schemas/home.json';
import exploreSchema from '../schemas/explore.json';

const LOCAL_FALLBACKS: Record<string, any> = {
  home: homeSchema,
  explore: exploreSchema,
};

const CACHE_PREFIX = '@sdui_screen_cache_';
const CACHE_TIME_PREFIX = '@sdui_screen_time_';

export async function fetchSDUIScreen(screenId: string): Promise<SDUIScreen> {
  const cacheKey = `${CACHE_PREFIX}${screenId}`;
  const cacheTimeKey = `${CACHE_TIME_PREFIX}${screenId}`;

  // 1. Try reading from Firebase Firestore if connected
  if (db) {
    try {
      const docRef = doc(db, 'sdui_screens', screenId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const firestoreData = snapshot.data();
        const validation = validateSDUIScreen(firestoreData);

        if (validation.success) {
          const validatedScreen = validation.data as SDUIScreen;
          // Asynchronously update cache
          AsyncStorage.setItem(cacheKey, JSON.stringify(validatedScreen)).catch(() => {});
          AsyncStorage.setItem(cacheTimeKey, Date.now().toString()).catch(() => {});
          return validatedScreen;
        } else {
          console.warn(`[SDUI] Firestore schema for "${screenId}" failed validation:`, validation.error);
        }
      }
    } catch (firebaseErr) {
      console.log(`[SDUI] Firebase fetch failed or not configured, using cache/fallback:`, (firebaseErr as any).message);
    }
  }

  // 2. Try reading from AsyncStorage local cache
  try {
    const cachedStr = await AsyncStorage.getItem(cacheKey);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      const validation = validateSDUIScreen(parsed);
      if (validation.success) {
        return validation.data as SDUIScreen;
      }
    }
  } catch (cacheErr) {
    console.warn(`[SDUI] Cache read error for "${screenId}":`, cacheErr);
  }

  // 3. Fall back to bundled default schemas
  const fallback = LOCAL_FALLBACKS[screenId];
  if (fallback) {
    const validation = validateSDUIScreen(fallback);
    if (validation.success) {
      return validation.data as SDUIScreen;
    }
  }

  // 4. Default minimal screen if nothing found
  return {
    screenId,
    version: 1,
    metadata: { title: 'Screen' },
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
