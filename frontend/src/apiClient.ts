// src/apiClient.ts
import axios from 'axios';

// 1. Récupérer l'URL de l'API depuis vos variables d'environnement
const API_URL = import.meta.env.VITE_API_URL; // (ex: http://127.0.0.1:8000)

// 2. Créer l'instance d'axios
const apiClient = axios.create({
  //
  // --- CORRECTION ICI ---
  // L'URL de base doit inclure /api
  //
  baseURL: `${API_URL}/api`, 
  // --- FIN DE LA CORRECTION ---
  
  // Indique à axios d'envoyer les cookies (nécessaire pour Sanctum)
  withCredentials: true, 
  
  // En-têtes par défaut pour toutes les requêtes
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

/**
 * Fonction pour initialiser l'authentification Sanctum.
 * Elle récupère le cookie CSRF.
 * * Vous devez appeler cette fonction UNE SEULE FOIS au démarrage
 * de votre application (par exemple dans main.tsx ou AppRouter.tsx).
 */
export const initSanctum = () => {
  //
  // --- CORRECTION ICI ---
  // L'appel doit maintenant se faire SANS /api car la baseURL l'a déjà
  // Mais /sanctum/csrf-cookie est une route SPÉCIALE qui n'est pas dans /api
  // Nous allons donc la recréer avec l'URL de base SANS /api
  //
  return axios.get(`${API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
  });
  // --- FIN DE LA CORRECTION ---
};

// 4. Exporter l'instance configurée pour l'utiliser dans vos pages
export default apiClient;