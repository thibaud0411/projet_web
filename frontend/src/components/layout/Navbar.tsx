import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; 

export const Navbar: React.FC = () => {
  return (
    <header className="manager-header">
      <div className="header-logo">
        <span className="fw-bold fs-5">Mon Miam Miam</span>
      </div>
      <nav className="header-nav">
                
        <NavLink to="/manager" end>
          <i className="bi bi-bar-chart-fill me-1"></i> Statistiques generales
        </NavLink>

        <NavLink to="/manager/orders">
          <i className="bi bi-receipt me-1"></i> Commandes
        </NavLink>
        
        {/* --- AJOUTEZ CES DEUX LIGNES --- */}
        <NavLink to="/manager/claims">
          <i className="bi bi-exclamation-triangle-fill me-1"></i> Réclamations
        </NavLink>
        <NavLink to="/manager/create-employee">
          <i className="bi bi-person-plus-fill me-1"></i> Gérer Employés
        </NavLink>
        {/* --- FIN DES AJOUTS --- */}


      </nav>
      <div className="header-profile">
        <i className="bi bi-person-circle me-2"></i> Gérant
      </div>
    </header>
  );
};