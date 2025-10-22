import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="footer-logo">
              <img src="assets/logo.png" alt="Mon Miam Miam" height="40" />
            </div>
            <p className="text-light">
              Solutions culinaires innovantes pour les entreprises modernes.
            </p>
          </div>
          
          <div className="col-lg-2">
            <h5 className="footer-title">Navigation</h5>
            <ul className="footer-links">
              <li>
                <a href="/Accueil">
                  <i className="fas fa-home"></i>Accueil
                </a>
              </li>
              <li>
                <a href="/Commandes">
                  <i className="fas fa-shopping-cart"></i>Commandes
                </a>
              </li>
              <li>
                <a href="/Stats">
                  <i className="fas fa-chart-bar"></i>Statistiques
                </a>
              </li>
              <li>
                <a href="/GestionMenu">
                  <i className="fas fa-utensils"></i>Gestion du menu
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3">
            <h5 className="footer-title">Légal</h5>
            <ul className="footer-links">
              <li>
                <a href="confidentialite.html">
                  <i className="fas fa-shield-alt"></i>Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="cookies.html">
                  <i className="fas fa-cookie"></i>Gestion des cookies
                </a>
              </li>
              <li>
                <a href="mentions-legales.html">
                  <i className="fas fa-gavel"></i>Mentions légales
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3">
            <h5 className="footer-title">Contact</h5>
            <div className="text-light">
              <p><i className="fas fa-envelope"></i> groupe3@monmiammiam.ucac-icam.com</p>
              <p><i className="fas fa-phone"></i> +242 06 655 04 30</p>
              <p><i className="fas fa-map-marker-alt"></i> Yansoki, Douala</p>
              
              <div className="social-links mt-3">
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="mb-0">&copy; 2025 Mon Miam Miam. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;