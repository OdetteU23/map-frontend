/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import type { AuthContextType, MainUserProviderProps, LoginData, RegisterData } from '../helpers/types/localTypes';
import type { User, ServiceProviderProfile } from 'map-hybrid-types-server';
import { api } from '../helpers/data/fetchData';
import type { AuthResponse } from '../helpers/data/fetchData';

const AuthContext = createContext<AuthContextType | null>(null);
const UserContext = createContext<User | ServiceProviderProfile | null>(null);

const AuthProvider = ({ children }: MainUserProviderProps) => {
  const [user, setUser] = useState<User | ServiceProviderProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const nowUser = await api.auth.getNowUser();
          setUser(nowUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginSuccess = async (loginData: LoginData) => {
    try {
      const response: AuthResponse = await api.auth.Login(loginData);
      // Use the user returned by the login response directly — no second API call needed
      setUser(response.user as User);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    }
  };

  const registerSuccess = async (registerData: RegisterData) => {
    try {
      const response: AuthResponse =
        registerData.role === 'provider'
          ? await api.auth.registerServiceProvider(registerData)
          : await api.auth.registerConsumer(registerData);

      setUser(response.user as User);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Register failed:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    }
  };

  const logout = async () => {
    try {
      api.auth.Logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const clearError = () => setError(null);

  const editUser = (updatedData: Partial<User | ServiceProviderProfile>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: isAuthenticated,
    isLoading,
    error,
    loginSuccess,
    registerSuccess,
    logout: () => { logout(); },
    clearError,
    editUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <UserContext.Provider value={user}>
        {children}
      </UserContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, UserContext };
