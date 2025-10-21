import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
//  theme, toggleTheme,
const Header = ({  activePage = 'index', notificationCount = 0 }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const isActive = (page) => page === activePage ? 'active' : '';

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src="assets/logo.png" alt="Mon Miam Miam" onError={(e) => {e.target.onerror = null; e.target.src='https://via.placeholder.com/150x50/cfbd97/000000?text=Mon+Miam+Miam'}} />
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            aria-expanded={isNavbarOpen}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className={`collapse navbar-collapse ${isNavbarOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className={`nav-link ${isActive('index')}`} href="/">
                  <i className="fas fa-home"></i>Accueil
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isActive('commandes')}`} href="/commandes">
                  <i className="fas fa-shopping-cart"></i>Commandes
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isActive('stats')}`} href="/stats">
                  <i className="fas fa-chart-bar"></i>Statistiques
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isActive('gestion')}`} href="/gestion">
                  <i className="fas fa-utensils"></i>Gestion du menu
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isActive('reclamations')}`} href="/reclamations">
                  <i className="fas fa-comments"></i>Réclamations
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </a>
              </li>
            </ul>
            
            <div className="d-flex align-items-center gap-3">
              {/* <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
              >
                <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
              </button> */}
              <a href="/logout" className="btn btn-connexion">
                <i className="fas fa-sign-in-alt"></i>Déconnexion
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;