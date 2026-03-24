"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { getToken, setToken as saveToken, removeToken } from '@/lib/token';

interface User {
  name?: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user info if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      setTokenState(token);
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          handleLogout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveToken(data.token);
      setTokenState(data.token);
      const me = await api.get('/auth/me');
      setUser(me.data.user);
      router.replace('/dashboard');
    } catch (err: any) {
      handleLogout();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setTokenState(null);
    setUser(null);
    removeToken();
    router.replace('/login');
  };

  // Auto logout on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(err);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login: handleLogin, logout: handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
