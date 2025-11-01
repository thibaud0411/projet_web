import { api, setAuthToken } from '../lib/apiClient';

export type UserRole = 'guest' | 'student' | 'employee' | 'admin' | 'gerant';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  points_balance?: number;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'mon_miam_miam_auth';

/**
 * Auth Service - Manages persistent authentication using localStorage
 */
export const authService = {
  /**
   * Save auth state to localStorage
   */
  saveAuth(user: AuthUser, token: string, role: UserRole): void {
    const authData: AuthState = {
      user,
      token,
      role,
      isAuthenticated: true,
    };
    // Stocker l'état d'authentification complet
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    // Stocker également le token directement pour un accès facile
    localStorage.setItem('token', token);
    // Configurer le token dans l'API client
    setAuthToken(token);
    
    console.log('Token saved to localStorage:', { 
      authData: { ...authData, token: '***' },
      tokenStored: token ? 'Token stored' : 'No token provided'
    });
  },

  /**
   * Load auth state from localStorage
   */
  loadAuth(): AuthState | null {
    try {
      // Essayer de charger depuis l'objet d'authentification
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const directToken = localStorage.getItem('token');
      
      if (!stored && !directToken) return null;
      
      let authData: AuthState | null = null;
      
      if (stored) {
        try {
          authData = JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing stored auth data:', e);
        }
      }
      
      // Si on a un token direct mais pas d'objet d'authentification valide
      if (directToken && (!authData || !authData.token)) {
        authData = {
          user: authData?.user || null,
          token: directToken,
          role: authData?.role || 'student', // Valeur par défaut
          isAuthenticated: true
        };
        // Sauvegarder l'état complet pour la prochaine fois
        if (authData.user) {
          this.saveAuth(authData.user, directToken, authData.role);
        }
      }
      
      // Configurer le token dans l'API client
      if (authData?.token) {
        setAuthToken(authData.token);
        console.log('Token loaded from localStorage:', { 
          hasToken: !!authData.token,
          user: authData.user ? { id: authData.user.id, email: authData.user.email } : 'No user'
        });
      }
      
      return authData;
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
      return null;
    }
  },

  /**
   * Clear auth state (logout)
   */
  clearAuth(): void {
    console.log('Clearing auth data from localStorage');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('token');
    setAuthToken(null);
    
    // Vérifier que tout a été supprimé
    console.log('Auth data cleared. Verification:', {
      hasAuthData: !!localStorage.getItem(AUTH_STORAGE_KEY),
      hasToken: !!localStorage.getItem('token')
    });
  },

  /**
   * Determine user role based on email or other criteria
   */
  determineRole(email: string): UserRole {
    if (email.includes('admin')) return 'admin';
    if (email.includes('employee') || email.includes('employe')) return 'employee';
    if (email.includes('gerant')) return 'gerant';
    return 'student';
  },

  /**
   * Login function - calls API and stores result
   */
  async login(email: string, password: string): Promise<{ user: AuthUser; role: UserRole }> {
    try {
      const response = await api.post('/login', { email, password });
      const user = response.data.user;
      const token = response.data.token;

      const role = this.determineRole(user.email);
      this.saveAuth(user, token, role);

      return { user, role };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  /**
   * Auto-login as test student (for development)
   */
  async autoLoginAsTestStudent(): Promise<{ user: AuthUser; role: UserRole }> {
    return this.login('student@test.com', 'password');
  },

  /**
   * Logout function
   */
  async logout(): Promise<void> {
    try {
      // Try to call backend logout (optional, as we clear token anyway)
      await api.post('/logout').catch(() => {
        // Ignore errors if backend is unreachable
      });
    } finally {
      this.clearAuth();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // Vérifier d'abord le token direct pour une meilleure fiabilité
    const directToken = localStorage.getItem('token');
    
    // Si on a un token direct, on considère que l'utilisateur est authentifié
    if (directToken) {
      console.log('Auth check: Direct token found');
      return true;
    }
    
    // Sinon, vérifier l'état d'authentification stocké
    const auth = this.getCurrentAuth();
    const isAuthenticated = !!auth?.isAuthenticated && !!auth.token;
    
    console.log('Auth check:', { 
      hasDirectToken: !!directToken,
      hasAuthState: !!auth,
      isAuthenticated,
      hasTokenInAuth: auth?.token ? 'Yes' : 'No'
    });
    
    return isAuthenticated;
  },

  /**
   * Get current auth state
   */
  getCurrentAuth(): AuthState | null {
    return this.loadAuth();
  },
};
