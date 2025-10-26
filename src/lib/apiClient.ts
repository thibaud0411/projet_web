import axios, { AxiosInstance } from 'axios';

// Remplacez par l'URL de base de votre API Laravel
const BASE_URL: string = 'http://localhost:8000/api'; 

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

/**
 * Définit ou supprime le token d'autorisation dans les en-têtes d'Axios.
 * @param token Le token JWT à utiliser, ou null pour supprimer.
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    // Utiliser le format Bearer Token standard pour les API JWT/Sanctum
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
