import React, { useState } from 'react'; // Importer useState
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import './ManagerLayout.css';

export const ManagerLayout: React.FC = () => {
  // --- AJOUT : État pour contrôler la sidebar sur mobile ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => { // Pour fermer en cliquant sur le backdrop
      setIsSidebarOpen(false);
  }
  // --- FIN AJOUT ---

  return (
    // Ajoute la classe 'sidebar-open' conditionnellement
    <div className={`manager-layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>

      {/* --- AJOUT : Bouton Burger passé en prop à Navbar --- */}
      <Navbar onToggleSidebar={toggleSidebar} />
      {/* --- FIN AJOUT --- */}

      {/* --- AJOUT : Backdrop pour fermer la sidebar --- */}
      <div className="sidebar-backdrop d-lg-none" onClick={closeSidebar}></div>
      {/* 'd-lg-none' cache le backdrop sur les grands écrans (>= lg / 992px) */}
      {/* --- FIN AJOUT --- */}


      {/* Contenu principal (inchangé) */}
      <main className="manager-main-content">
        <Outlet />
      </main>

      {/* Footer (inchangé) */}
      <Footer />
    </div>
  );
};