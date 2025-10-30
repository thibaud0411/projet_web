// src/main.tsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// ROUTEUR / APP
import { AppRouter } from './routes/AppRouter'; // si tu veux utiliser AppRouter
// import App from './App.tsx'; // si tu préfères utiliser App directement

// API Client / Axios
import axios from 'axios';
// import { initSanctum } from './apiClient'; // si tu veux utiliser ta fonction initSanctum

// STYLES
import 'bootstrap/dist/css/bootstrap.min.css';         // Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';     // Bootstrap Icons
import 'aos/dist/aos.css';                              // AOS Animations
import './index.css';                                   // Tes styles, toujours en dernier

// Fonction pour initialiser Sanctum CSRF
const initializeSanctum = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
    console.log("Sanctum CSRF cookie initialisé.");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Sanctum CSRF:", error);
  }
};

// Initialisation et rendu de l'app
initializeSanctum().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />  {/* Remplacer par <App /> si tu veux */}
    </StrictMode>
  );
}).catch(error => {
  console.error("Erreur lors du lancement de l'application:", error);
});
