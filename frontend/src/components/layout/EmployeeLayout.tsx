// src/components/layout/EmployeeLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeNavbar } from './EmployeeNavbar';
import { Footer } from './Footer';

// Ce CSS gère la disposition principale (padding, etc.)
import './ManagerLayout.css'; 

export const EmployeeLayout: React.FC = () => {
  return (
    // Ces classes viennent de ManagerLayout.css
    <div className="manager-layout-container">
      
      {/* Barre de navigation (fixe en haut) */}
      <EmployeeNavbar />
      
      <main className="manager-main-content">
        {/* Outlet rendra le composant de la page enfant (Dashboard, Menu, etc.) */}
        <Outlet />
      </main>
      
      {/* Pied de page (fixe en bas) */}
      <Footer />
    </div>
  );
};