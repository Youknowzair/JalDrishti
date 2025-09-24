import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'community' | 'agent' | 'admin';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  demoLogin: (role: 'community' | 'agent' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('jal-drishti-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('jal-drishti-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const json = await res.json();
      const loggedInUser: User = {
        ...json.data.user,
        token: json.data.token,
      };
      setUser(loggedInUser);
      localStorage.setItem('jal-drishti-user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jal-drishti-user');
  };

  const demoLogin = (role: 'community' | 'agent' | 'admin') => {
    const demoUser: User = {
      id: `demo-${role}`,
      email: `${role}@demo.com`,
      firstName: role.charAt(0).toUpperCase() + role.slice(1),
      lastName: 'Demo',
      role: role,
      token: `demo-token-${role}-${Date.now()}`
    };
    
    setUser(demoUser);
    localStorage.setItem('jal-drishti-user', JSON.stringify(demoUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    demoLogin
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}
