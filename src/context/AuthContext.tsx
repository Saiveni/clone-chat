import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/chat';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('whatsapp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - in production, this would call Firebase/backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage (simulating database)
    const users = JSON.parse(localStorage.getItem('whatsapp_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser && existingUser.password === password) {
      const userData: User = {
        id: existingUser.id,
        name: existingUser.name,
        avatar: existingUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUser.name}`,
        phone: existingUser.phone,
        about: existingUser.about || 'Hey there! I am using WhatsApp',
        lastSeen: new Date(),
        isOnline: true,
      };
      setUser(userData);
      localStorage.setItem('whatsapp_user', JSON.stringify(userData));
      return;
    }
    
    throw new Error('Invalid email or password');
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('whatsapp_users') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists with this email');
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
      phone,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      about: 'Hey there! I am using WhatsApp',
    };
    
    users.push(newUser);
    localStorage.setItem('whatsapp_users', JSON.stringify(users));
    
    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      avatar: newUser.avatar,
      phone: newUser.phone,
      about: newUser.about,
      lastSeen: new Date(),
      isOnline: true,
    };
    
    setUser(userData);
    localStorage.setItem('whatsapp_user', JSON.stringify(userData));
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
        signUp,
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
