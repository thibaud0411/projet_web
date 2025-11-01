import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AxiosResponse } from 'axios';
import apiClient from '../apiClient';
import type { User, AuthContextType } from '../types';

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
      // Clear any old data first
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Login request
      const response = await apiClient.post<{ token: string; user: User; message: string }>('/login', 
        { email, password, remember }
      );

      const { token, user } = response.data;
      
      // Store token (keep it small to avoid 431 errors)
      localStorage.setItem('auth_token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user state
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
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
      // Clear any old data first
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];

      // Register
      const response = await apiClient.post<{ token: string; user: User; message: string }>('/register', userData);

      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('auth_token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
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
