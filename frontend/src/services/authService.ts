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
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setAuthToken(token);
  },

  /**
   * Load auth state from localStorage
   */
  loadAuth(): AuthState | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: AuthState = JSON.parse(stored);
      
      // Set the token in API client
      if (authData.token) {
        setAuthToken(authData.token);
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthToken(null);
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
    const auth = this.loadAuth();
    return auth !== null && auth.isAuthenticated && auth.token !== null;
  },

  /**
   * Get current auth state
   */
  getCurrentAuth(): AuthState | null {
    return this.loadAuth();
  },
};
