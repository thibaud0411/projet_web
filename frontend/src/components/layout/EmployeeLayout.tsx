// src/components/layout/EmployeeLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeNavbar } from './EmployeeNavbar'; // Utilise la Navbar Employé
import { Footer } from './Footer'; // Utilise le Footer commun ou un spécifique
// Assurez-vous d'avoir un fichier CSS (ex: EmployeeLayout.css) si nécessaire
// import './EmployeeLayout.css';
import './ManagerLayout.css'; // Réutilise le CSS du ManagerLayout pour la structure de base

export const EmployeeLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
      setIsSidebarOpen(false);
  }

  return (
    // Utilise les mêmes classes CSS que ManagerLayout pour la structure sidebar/contenu
    <div className={`manager-layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>

      <EmployeeNavbar onToggleSidebar={toggleSidebar} />

      <div className="sidebar-backdrop d-lg-none" onClick={closeSidebar}></div>

      {/* NOTE: La sidebar mobile n'est pas définie dans vos fichiers.
        Elle serait implémentée ici si nécessaire.
      */}

      <main className="manager-main-content"> {/* Réutilise la classe pour le padding */}
        <Outlet /> {/* Affiche le contenu de la page actuelle */}
      </main>

      <Footer />
    </div>
  );
};