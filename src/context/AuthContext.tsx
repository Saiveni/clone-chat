import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userDocUnsubscribe: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Clean up previous user document listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Listen for real-time updates to user document
        userDocUnsubscribe = onSnapshot(doc(db, 'users', fbUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              id: fbUser.uid,
              name: userData.name || 'User',
              avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
              phone: userData.phone || '',
              about: userData.about || 'Hey there! I am using WhatsApp',
              lastSeen: userData.lastSeen?.toDate() || new Date(),
              isOnline: true,
            });
          }
          setIsLoading(false);
        });
        
        // Update online status
        await updateDoc(doc(db, 'users', fbUser.uid), {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []);
  
  const refreshUser = async () => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          name: userData.name || 'User',
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
          phone: userData.phone || '',
          about: userData.about || 'Hey there! I am using WhatsApp',
          lastSeen: userData.lastSeen?.toDate() || new Date(),
          isOnline: true,
        });
      }
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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
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
        refreshUser,
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
