import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setSyncStatus('synced');
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setSyncStatus('error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        setSyncStatus,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
