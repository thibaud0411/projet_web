// User type (matches backend response)
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'administrateur' | 'gerant' | 'client';
  points_fidelite?: number;
}

// Form error type
export interface FormErrors {
  [key: string]: string[] | string | null | undefined;
  general?: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register?: (userData: any) => Promise<void>; // You might want to define a proper type for userData
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGerant: boolean;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
}
