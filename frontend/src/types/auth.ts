export type FormErrors = Record<string, string | string[] | undefined>;

export interface AuthErrors extends FormErrors {
  email?: string | string[];
  password?: string | string[];
  general?: string;
  [key: string]: string | string[] | undefined;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'administrateur' | 'gerant' | 'employe' | 'etudiant';
  statut_compte: 'actif' | 'inactif' | 'en_attente';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember?: boolean) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  register: (userData: RegisterFormData) => Promise<RegisterResponse>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGerant: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'administrateur' | 'gerant' | 'employe' | 'etudiant';
  statut_compte: 'actif' | 'inactif' | 'en_attente';
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}
