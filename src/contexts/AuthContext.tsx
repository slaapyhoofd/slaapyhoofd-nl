import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import * as authService from '@/services/auth';
import { setCsrfToken } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
        setCsrfToken(response.data.csrf_token);
      } else {
        setUser(null);
        setCsrfToken('');
      }
    } catch {
      setUser(null);
      setCsrfToken('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    if (response.success && response.data) {
      setUser(response.data.user);
      setCsrfToken(response.data.csrf_token);
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setCsrfToken('');
  };

  // React 19: render context directly — no .Provider needed
  return <AuthContext value={{ user, loading, login, logout, checkAuth }}>{children}</AuthContext>;
}
