import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const isConfigured = Boolean(
  apiKey && 
  apiKey !== 'your-api-key' && 
  apiKey.trim().length > 5 &&
  !apiKey.includes('your-')
);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (isConfigured) {
  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    appInstance = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
  } catch (err) {
    console.warn('⚠️ Firebase initialization failed:', err);
  }
}

export const isFirebaseConfigured = isConfigured && authInstance !== null;
export const auth = authInstance;

