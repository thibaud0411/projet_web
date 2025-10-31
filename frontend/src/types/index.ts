// User type
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'administrateur' | 'gerant' | 'client';
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
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
