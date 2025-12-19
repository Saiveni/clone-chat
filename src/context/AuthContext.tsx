import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/chat';
import { currentUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('whatsapp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string) => {
    // Simulate sending OTP
    setPendingPhone(phone);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    // Simulate OTP verification (accept any 6-digit code)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (otp.length === 6) {
      const userData = {
        ...currentUser,
        phone: pendingPhone || currentUser.phone,
      };
      setUser(userData);
      localStorage.setItem('whatsapp_user', JSON.stringify(userData));
      setPendingPhone(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('whatsapp_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOtp,
        logout,
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
