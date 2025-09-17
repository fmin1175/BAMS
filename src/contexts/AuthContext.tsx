'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  academyId: number;
}

interface Academy {
  id: number;
  name: string;
  email: string;
  subscriptionPlan: string;
}

interface AuthContextType {
  user: User | null;
  academy: Academy | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // In a real app, you'd validate the token with your API
        // For now, we'll simulate a logged-in state
        const userData = localStorage.getItem('userData');
        const academyData = localStorage.getItem('academyData');
        
        if (userData && academyData) {
          setUser(JSON.parse(userData));
          setAcademy(JSON.parse(academyData));
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('academyData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call - in real app, this would be an actual API request
      // For demo purposes, we'll accept any email/password combination
      if (email && password) {
        const mockUser: User = {
          id: 1,
          email: email,
          firstName: 'Academy',
          lastName: 'Owner',
          role: 'admin',
          academyId: 1
        };

        const mockAcademy: Academy = {
          id: 1,
          name: 'Default Academy',
          email: 'admin@defaultacademy.com',
          subscriptionPlan: 'Basic'
        };

        // Store auth data
        localStorage.setItem('authToken', 'mock-jwt-token');
        localStorage.setItem('userData', JSON.stringify(mockUser));
        localStorage.setItem('academyData', JSON.stringify(mockAcademy));

        setUser(mockUser);
        setAcademy(mockAcademy);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('academyData');
    setUser(null);
    setAcademy(null);
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    academy,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}