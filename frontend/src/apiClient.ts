// src/apiClient.ts (Version Finale Recommandée)

import axios from 'axios';

// 1. Récupérer l'URL de l'API depuis les variables d'environnement (de Fichier 1)
const API_URL = import.meta.env.VITE_API_URL; // Exemple : http://127.0.0.1:8000

// 2. Créer l'instance axios
const apiClient = axios.create({
  // URL de base pour toutes les requêtes API (de Fichier 1)
  baseURL: `${API_URL}/api`,
  
  // Essentiel pour l'authentification par cookie Sanctum (des deux fichiers)
  withCredentials: true,
  
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Header important volé au Fichier 2 (indique à Laravel que c'est une requête AJAX)
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// 3. Fonction pour initialiser Sanctum (de Fichier 1, vitale)
//    Elle doit être appelée UNE SEULE FOIS au démarrage de l'application
export const initSanctum = () => {
  // L'URL /sanctum/csrf-cookie n'est PAS dans /api
  return axios.get(`${API_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};

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