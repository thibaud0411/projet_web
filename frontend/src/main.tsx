// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './routes/AppRouter'; // Modifié pour pointer vers votre routeur
import './index.css';
import 'aos/dist/aos.css'; // Ajout de l'import AOS CSS

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter /> {/* Rendu du routeur principal */}
  </React.StrictMode>,
);