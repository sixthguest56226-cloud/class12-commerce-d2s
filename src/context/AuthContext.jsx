import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { setStoredDriveToken, clearStoredDriveToken, getStoredDriveToken } from '../utils/googleDrive';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const storedToken = getStoredDriveToken(currentUser.uid);
        if (storedToken) setAccessToken(storedToken);
      } else {
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token && result.user) {
        setStoredDriveToken(result.user.uid, token);
        setAccessToken(token);
      }

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
      if (user) {
        clearStoredDriveToken(user.uid);
      }
      await signOut(auth);
      setUser(null);
      setAccessToken(null);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        syncStatus,
        setSyncStatus,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
