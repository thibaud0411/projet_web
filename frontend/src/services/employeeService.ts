import apiClient from '../apiClient'; // On importe notre "téléphone"
import type { Employee, NewEmployeeData } from '../pages/manager/EmployeeCreatePage'; // On importe les types

// Fonction pour LIRE tous les employés
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await apiClient.get('/employees');
  return response.data; // On renvoie directement les données
};

// Fonction pour CRÉER un employé
// Remarquez qu'on passe les données nécessaires en arguments
export const createEmployee = async (data: NewEmployeeData, password: string): Promise<Employee> => {
  const response = await apiClient.post('/employees', {
    nom: data.nom,
    email: data.email,
    phone: data.phone,
    password: password,
  });
  return response.data; // On renvoie le nouvel employé créé
};

// Fonction pour SUPPRIMER un employé
export const deleteEmployee = async (employeeId: number): Promise<void> => {
  await apiClient.delete(`/employees/${employeeId}`);
  // Pas besoin de renvoyer quelque chose pour une suppression
};

// (Plus tard, vous pourriez ajouter: getEmployeeById, updateEmployee, etc.)