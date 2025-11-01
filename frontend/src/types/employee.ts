export type EmployeeRole = 'administrateur' | 'gerant' | 'employe';

export interface Employee {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: EmployeeRole;
  statut_compte: 'actif' | 'inactif';
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: EmployeeRole;
  password?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
