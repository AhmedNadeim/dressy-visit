import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authApi, TokenStore } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  login:  (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialState(): AuthState {
  return {
    isAuthenticated: !!TokenStore.get(),
    username: localStorage.getItem('dressy_username'),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  const login = useCallback(async (username: string, password: string) => {
    const { token, refreshToken } = await authApi.login(username, password);
    TokenStore.set(token, refreshToken);
    localStorage.setItem('dressy_username', username);
    setState({ isAuthenticated: true, username });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    TokenStore.clear();
    localStorage.removeItem('dressy_username');
    setState({ isAuthenticated: false, username: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
