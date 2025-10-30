// src/apiClient.ts
import axios from 'axios';

// 1. Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL; // Exemple : http://127.0.0.1:8000

// 2. Créer l'instance axios pour les requêtes vers /api
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,  // Toutes les requêtes utiliseront cette base URL
  withCredentials: true,      // Important pour Sanctum / cookies
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// 3. Fonction pour initialiser Sanctum (CSRF cookie)
//    Elle doit être appelée UNE SEULE FOIS au démarrage de l'application
export const initSanctum = () => {
  // L'URL /sanctum/csrf-cookie n'est PAS dans /api
  return axios.get(`${API_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};

// 4. Exporter l'instance axios configurée
export default apiClient;
