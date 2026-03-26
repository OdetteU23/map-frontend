import { createContext, useContext, useState, useCallback } from 'react';
import type { User } from 'map-hybrid-types-server';

type AuthUser = Pick<User, 'id' | 'Firstname' | 'Lastname' | 'username' | 'email' | 'role'>;

type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  loginSuccess: (authenticatedUser: AuthUser) => void;
  registerSuccess: (newUser: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  setAuthError: (msg: string | null) => void;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called after a successful backend login – pass the authenticated user data
  const loginSuccess = useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setError(null);
  }, []);

  // Called after a successful backend register – pass the new user data
  const registerSuccess = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);
  const setAuthError = useCallback((msg: string | null) => setError(msg), []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, error, loginSuccess, registerSuccess, setLoading, setAuthError, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
