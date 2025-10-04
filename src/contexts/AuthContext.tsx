'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtVerify, SignJWT } from 'jose';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SYSTEM_ADMIN' | 'ACADEMY_ADMIN' | 'COACH';
  academyId: number;
  trialExpiryDate?: string; // Added for free trial expiry
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user token is stored in cookies
    const token = Cookies.get('auth_token');
    if (token) {
      try {
        // Decode the token to get user data (client-side)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const parsedUser = JSON.parse(jsonPayload);
        
        // Check if the user is on a free trial and if it has expired
        if (parsedUser.trialExpiryDate) {
          const expiryDate = new Date(parsedUser.trialExpiryDate);
          const currentDate = new Date();
          
          if (currentDate > expiryDate) {
            // Trial has expired, log the user out
            console.log('Free trial has expired. Logging out.');
            Cookies.remove('auth_token');
            setUser(null);
            setLoading(false);
            return;
          }
        }
        
        // Ensure the role is one of the allowed values in the User interface
        if (parsedUser.role && typeof parsedUser.role === 'string') {
          // Convert to proper enum value if it's a string
          const validRole = ['SYSTEM_ADMIN', 'ACADEMY_ADMIN', 'COACH'].includes(parsedUser.role.toUpperCase())
            ? parsedUser.role.toUpperCase() as 'SYSTEM_ADMIN' | 'ACADEMY_ADMIN' | 'COACH'
            : 'ACADEMY_ADMIN'; // Default to ACADEMY_ADMIN if invalid
          
          // Create a properly typed user object
          setUser({
            ...parsedUser,
            role: validRole
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Make a real API call to authenticate the user
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const userData = await response.json();
      
      // The API endpoint already sets the auth_token cookie, so we don't need to set it here
      // Just update the user state with the returned data
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the logout API to clear server-side cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Also clear client-side cookie
      Cookies.remove('auth_token');
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still attempt to logout locally even if API call fails
      Cookies.remove('auth_token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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