import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import apiClient from '../apiClient';
import { User, AuthContextType } from '../types';

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // No need to set up axios defaults - apiClient is already configured

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (): Promise<void> => {
    try {
      const response: AxiosResponse<User> = await apiClient.get('/user');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, remember: boolean = false): Promise<void> => {
    try {
      console.log('AuthContext: Getting CSRF cookie...');
      // Get CSRF cookie first (not under /api) - MUST use direct URL for CSRF to work
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
      console.log('AuthContext: CSRF cookie obtained');

      console.log('AuthContext: Sending login request...');
      // Then login
      const response = await apiClient.post<{ token: string; user: User; message: string }>('/login', {
        email,
        password,
        remember
      });
      console.log('AuthContext: Login response received:', response.data);

      // Store token
      const { token, user } = response.data;
      console.log('AuthContext: Storing token and user data');
      localStorage.setItem('auth_token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user state - this will trigger re-renders
      setUser(user);
      console.log('AuthContext: User state updated, login complete');

      // Return the user so Login.tsx can use it
      return user;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      // Get CSRF cookie first (not under /api) - MUST use direct URL
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });

      // Then register
      const response = await apiClient.post<{ token: string; user: User; message: string }>('/register', userData);

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'administrateur',
    isGerant: user?.role === 'gerant'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
