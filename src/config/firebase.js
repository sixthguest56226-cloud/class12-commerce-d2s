import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-class12commerce-auth-key-v1",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "class-12-commerce-study.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "class-12-commerce-study",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "304920226",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:304920226:web:c12commercestudy"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
// Add Google Drive file scope for personal note attachments (100% free Spark plan)
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

const db = getFirestore(app);

export { app, auth, googleProvider, db };
