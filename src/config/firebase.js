import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-class12commerce-auth-key-v1",
  authDomain: "class12-commerce-d2s.firebaseapp.com",
  projectId: "class12-commerce-d2s",
  storageBucket: "class12-commerce-d2s.firebasestorage.app",
  messagingSenderId: "304920226",
  appId: "1:304920226:web:c12commercestudy"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, googleProvider, db, storage };
