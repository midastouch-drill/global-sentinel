
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase client config - these are safe to expose in client bundles
const firebaseConfig = {
  apiKey: "AIzaSyCDHDzHGct1LQ2ssw17Lgio16bK9W2r4KE",
  authDomain: "global-sentinel-aa33c.firebaseapp.com",
  projectId: "global-sentinel-aa33c",
  storageBucket: "global-sentinel-aa33c.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Export the app instance
export default app;
