import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

// Only consider Firebase genuinely configured if a real user API key exists
export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey !== 'demo-api-key' &&
  !apiKey.startsWith('demo-')
);

let app: any = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn('[Firebase] Initialized with error, falling back to local mode:', error);
  }
}

export { app, db };
