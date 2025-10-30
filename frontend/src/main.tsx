// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './routes/AppRouter';
import { initSanctum } from './apiClient'; // <<< 1. IMPORTER (Chemin mis à jour)

// 1. Bootstrap (Grille et composants)
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Icônes Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';

// 3. AOS (Animations)
import 'aos/dist/aos.css'; 

// 4. VOS STYLES (DOIT ÊTRE LE DERNIER)
import './index.css'; 

// 2. APPELER LA FONCTION AVANT DE LANCER L'APP
initSanctum().then(() => {
  // Le cookie CSRF est (normalement) défini, on peut monter l'app
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <AppRouter />
    </React.StrictMode>,
  );
}).catch(error => {
   console.error("Erreur lors de l'initialisation de Sanctum:", error);
});