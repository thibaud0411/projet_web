// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './routes/AppRouter';

// 1. Bootstrap (Grille et composants)
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Icônes Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';

// 3. AOS (Animations)
import 'aos/dist/aos.css'; 

// 4. VOS STYLES (DOIT ÊTRE LE DERNIER)
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);