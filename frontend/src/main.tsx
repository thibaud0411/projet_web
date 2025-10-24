import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx';
// 1. Importez votre apiClient
import apiClient from './apiClient';

// 2. Fonction pour appeler l'endpoint CSRF de Sanctum
const initializeSanctum = async () => {
  try {
    // Fait un appel GET à http://localhost:8000/sanctum/csrf-cookie
    await apiClient.get('/sanctum/csrf-cookie');
    console.log("Sanctum CSRF cookie initialisé."); // Message de succès
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Sanctum CSRF:", error);
    // Dans un cas réel, vous pourriez vouloir afficher une erreur à l'utilisateur ici
  }
};

// 3. Appelez cette fonction immédiatement au chargement de l'app
initializeSanctum();

// Le reste de votre fichier
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);