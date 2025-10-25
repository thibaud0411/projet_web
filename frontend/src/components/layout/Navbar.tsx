import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

// Interface pour les props (avec la fonction de toggle)
interface NavbarProps {
    onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="manager-header">

      {/* --- AJOUT : Bouton Burger (visible seulement sur mobile/tablette) --- */}
      <button
        className="sidebar-toggle-button d-lg-none" // 'd-lg-none' le cache sur grand écran
        onClick={onToggleSidebar}
        aria-label="Ouvrir le menu latéral"
      >
        <i className="bi bi-list"></i> {/* Icône Burger */}
      </button>
      {/* --- FIN AJOUT --- */}


      <div className="header-logo">
        {/* Lien optionnel vers le tableau de bord */}
        <NavLink to="/manager" className="d-none d-lg-block">
            Mon Miam Miam
        </NavLink>
         {/* Titre simple sur mobile (centré si besoin avec CSS) */}
         <span className="d-lg-none">Mon Miam Miam</span>
      </div>

      {/* Navigation (inchangée) */}
      <nav className="header-nav">
        <NavLink to="/manager" end>
          <i className="bi bi-bar-chart-fill"></i> <span>Tableau de Bord</span>
        </NavLink>
        <NavLink to="/manager/orders">
          <i className="bi bi-receipt"></i> <span>Commandes</span>
        </NavLink>
        <NavLink to="/manager/claims">
          <i className="bi bi-exclamation-triangle-fill"></i> <span>Réclamations</span>
        </NavLink>
        <NavLink to="/manager/create-employee">
          <i className="bi bi-person-plus-fill"></i> <span>Employés</span>
        </NavLink>
        {/* Ajouter d'autres liens ici si besoin */}
      </nav>

      {/* Profil (inchangé) */}
      <div className="header-profile">
        <i className="bi bi-person-circle"></i> Gérant
      </div>
    </header>
  );
};