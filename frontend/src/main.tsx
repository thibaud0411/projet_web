// src/index.tsx (ou main.tsx)

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Importer le SEUL composant App (le Fichier 2)
import App from './App';

// 2. Importer tous les styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import './index.css'; // Vos styles, toujours en dernier

initSanctum().finally(() => {
  
  // 3. Rendre l'application SEULEMENT APRÈS que initSanctum soit terminé
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Failed to find the root element');
  }
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

});