import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx';
// On importe axios directement ici aussi
import axios from 'axios';
// import apiClient from './apiClient'; // On n'en a plus besoin ici

// Fonction pour appeler l'endpoint CSRF de Sanctum
const initializeSanctum = async () => {
  try {
    // 1. On utilise axios directement avec l'URL complète
    //    ET on ajoute withCredentials ici aussi !
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
    });
    console.log("Sanctum CSRF cookie initialisé."); // Message de succès
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Sanctum CSRF:", error);
  }
};

// Appelez cette fonction immédiatement au chargement
initializeSanctum();

// Le reste de votre fichier
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);