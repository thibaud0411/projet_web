// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Importer le SEUL composant App (TypeScript version)
import App from './App.tsx';

// 2. Importer tous les styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css';
import './index.css'; // Vos styles, toujours en dernier

// 3. Rendre l'application directement
// NOTE: initSanctum is now called only when needed (login/register), not on app startup
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