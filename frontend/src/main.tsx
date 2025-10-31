import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Importer le BON routeur (celui dans le dossier /router/)
import { AppRouter } from './router/AppRouter'; 

// 2. Importer le Fournisseur d'Authentification (la "bouteille")
import { AuthProvider } from './context/AuthContext';

// 3. Importer tous les styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import './index.css'; // Tes styles, toujours en dernier

// 4. Rendu de l'application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 5. On enveloppe le BON routeur avec la "bouteille" */}
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);