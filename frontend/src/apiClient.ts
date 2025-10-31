// src/apiClient.ts (Version Finale Recommandée)

import axios from 'axios';

// 1. Get API URL from environment - MUST use direct URL for CSRF to work
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 2. Créer l'instance axios
const apiClient = axios.create({
  // URL de base pour toutes les requêtes API - MUST be direct URL
  baseURL: `${API_URL}/api`,
  
  // Essentiel pour l'authentification par cookie Sanctum
  withCredentials: true,
  
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// 3. Fonction pour initialiser Sanctum
export const initSanctum = () => {
  // L'URL /sanctum/csrf-cookie n'est PAS dans /api - MUST be direct URL
  return axios.get(`${API_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};

// 3.5. Intercepteur de REQUÊTE - Ajoute le token CSRF depuis les cookies
apiClient.interceptors.request.use((config) => {
  // Lire le cookie XSRF-TOKEN
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  // Si le token existe, l'ajouter au header X-XSRF-TOKEN
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 4. Intercepteur de RÉPONSE (volé au Fichier 2, excellente idée)
//    Il s'exécute APRÈS avoir reçu une réponse du serveur
apiClient.interceptors.response.use(
  
  // Si la réponse est réussie (status 2xx), on ne fait rien
  (response) => response,
  
  // Si la réponse est une erreur...
  (error) => {
    // Si l'erreur est un 401 (Non autorisé)
    if (error.response?.status === 401) {
      // L'utilisateur n'est plus authentifié (session expirée, etc.)
      
      // On supprime les infos utilisateur du localStorage (si elles existent)
      localStorage.removeItem('user');
      // (Pas besoin de 'auth_token' car on utilise des cookies)
      
      // On redirige l'utilisateur vers la page de connexion
      // 'replace' empêche l'utilisateur de revenir en arrière
      window.location.replace('/login');
    }

    // On renvoie l'erreur pour que les autres 'catch' puissent la gérer
    return Promise.reject(error);
  }
);

// 5. Exporter l'instance axios configurée
export default apiClient;