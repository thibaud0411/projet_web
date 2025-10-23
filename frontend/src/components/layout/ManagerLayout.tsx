import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar'; // Importé depuis le même dossier
import { Footer } from './Footer'; // Importé depuis le même dossier
import './ManagerLayout.css'; 

export const ManagerLayout: React.FC = () => {
  return (
    <div className="manager-layout-container">
      {/* 1. Barre de navigation (basée sur votre arborescence) */}
      <Navbar /> 
      
      {/* 2. Contenu principal (où les pages enfants s'affichent) */}
      <main className="manager-main-content">
        <Outlet /> 
      </main>
      
      {/* 3. Footer (basé sur votre arborescence) */}
      <Footer />
    </div>
  );
};