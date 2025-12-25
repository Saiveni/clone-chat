/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types/chat';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Listen to user profile changes in real-time
        const userDocRef = doc(db, 'users', fbUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              id: fbUser.uid,
              name: userData.name || 'User',
              avatar: userData.avatar || null,
              phone: userData.phone || '',
              about: userData.about || 'Hey there! I am using WhatsApp',
              lastSeen: userData.lastSeen?.toDate() || new Date(),
              isOnline: true,
            });
          }
        });
        // Update online status
        await updateDoc(userDocRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
        // Store unsubscribe for user doc listener
        return () => unsubscribeUser();
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserAvatar = (avatar: string) => {
    if (user) {
      setUser({ ...user, avatar });
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    // Update online status
    await updateDoc(doc(db, 'users', fbUser.uid), {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', fbUser.uid), {
      email,
      name,
      phone,
      avatar: null,
      about: 'Hey there! I am using WhatsApp',
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    if (firebaseUser) {
      // Update offline status before signing out
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        updateUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
