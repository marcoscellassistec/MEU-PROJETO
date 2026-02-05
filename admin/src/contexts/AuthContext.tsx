import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.setToken(token);
      api.get<User>('/auth/me')
        .then(userData => {
          if (userData.role !== 'ADMIN') {
            throw new Error('Acesso negado');
          }
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          setToken(null);
          api.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    if (data.user.role !== 'ADMIN') {
      throw new Error('Acesso restrito a administradores');
    }
    localStorage.setItem('admin_token', data.token);
    api.setToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
