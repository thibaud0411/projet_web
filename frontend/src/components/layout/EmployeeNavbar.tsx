// src/components/layout/EmployeeNavbar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// Import corrigé pour pointer vers le bon fichier CSS
import './EmployeeNavbar.css'; 
// Import des styles Navbar généraux (si EmployeeNavbar.css ne contient pas tout)
import './Navbar.css';

interface EmployeeNavbarProps {
    onToggleSidebar: () => void;
}

export const EmployeeNavbar: React.FC<EmployeeNavbarProps> = ({ onToggleSidebar }) => {

  // Simule des notifications pour l'employé si nécessaire
  // const notificationCount = 2; // Exemple
    const notificationCount = 0;

  return (
    // Utilise la structure et les classes de la Navbar Manager
    <header className="manager-header">

      <button
        className="sidebar-toggle-button d-lg-none"
        onClick={onToggleSidebar}
        aria-label="Ouvrir le menu latéral"
      >
        <i className="bi bi-list"></i>
      </button>

      <div className="header-logo">
        <NavLink to="/employee" className="d-none d-lg-block">
            Mon Miam Miam (Employé)
        </NavLink>
         <span className="d-lg-none">Employé</span>
      </div>

      {/* Liens spécifiques à l'employé */}
      <nav className="header-nav">
        <NavLink to="/employee" end>
          <i className="bi bi-house-door-fill"></i> <span>Accueil</span>
        </NavLink>
        <NavLink to="/employee/orders">
          <i className="bi bi-receipt"></i> <span>Commandes</span>
        </NavLink>
        <NavLink to="/employee/menu">
          <i className="bi bi-journal-text"></i> <span>Menu du Jour</span>
        </NavLink>
        <NavLink to="/employee/claims">
          <i className="bi bi-chat-left-dots-fill"></i> <span>Réclamations</span>
           {notificationCount > 0 && (
             <span className="badge rounded-pill bg-danger ms-1">{notificationCount}</span>
          )}
        </NavLink>
         <NavLink to="/employee/stats">
             <i className="bi bi-graph-up"></i> <span>Statistiques</span>
         </NavLink>
      </nav>

      {/* Profil/Déconnexion */}
      <div className="header-profile">
        <i className="bi bi-person-circle"></i> Employé
        {/* TODO: Ajoutez un bouton/lien de déconnexion ici */}
        {/* <button className='btn btn-sm btn-outline-light ms-3'>Déconnexion</button> */}
      </div>
    </header>
  );
};