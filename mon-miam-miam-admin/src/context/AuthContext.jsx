import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('=== LOGIN DEBUG START ===');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Full URL:', api.defaults.baseURL + '/login');
      console.log('Request method: POST');
      console.log('Request payload:', { email, password });
      console.log('Request headers:', api.defaults.headers);
      
      const response = await api.post('/login', { email, password });
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);
      console.log('=== LOGIN DEBUG END ===');
      
      const { token, user } = response.data;
      
      // Check if user is admin or gerant
      if (!['administrateur', 'gerant'].includes(user.role)) {
        throw new Error('Accès non autorisé. Seuls les administrateurs et gérants peuvent se connecter.');
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Connexion réussie!');
      return true;
    } catch (error) {
      const message = error.message || error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'administrateur',
    isGerant: user?.role === 'gerant',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};