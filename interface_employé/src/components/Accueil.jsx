import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'aos/dist/aos.css';
import AOS from 'aos';


// Components
import Header from './Header';
import Footer from './Footer';

// Styles
import '../styles/GlobalStyles.css';

const Accueil = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Initialiser AOS
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });

    // Appliquer le thème au body
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Animation des compteurs
  const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(start);
      }
    }, 16);
  };

  useEffect(() => {
    // Simuler des données en temps réel
    const liveData = {
      orders: 47,
      customers: 128,
      menuItems: 24,
      satisfaction: 94
    };

    // Animer les compteurs
    setTimeout(() => {
      const ordersElement = document.getElementById('live-orders');
      const customersElement = document.getElementById('active-customers');
      const menuItemsElement = document.getElementById('menu-items');
      const satisfactionElement = document.getElementById('satisfaction-rate');

      if (ordersElement) animateCounter(ordersElement, liveData.orders);
      if (customersElement) animateCounter(customersElement, liveData.customers);
      if (menuItemsElement) animateCounter(menuItemsElement, liveData.menuItems);
      
      if (satisfactionElement) {
        let satisfaction = 0;
        const satisfactionTimer = setInterval(() => {
          satisfaction += 1;
          satisfactionElement.textContent = satisfaction + '%';
          if (satisfaction >= liveData.satisfaction) {
            clearInterval(satisfactionTimer);
          }
        }, 20);
      }
    }, 1000);
  }, []);

  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} activePage="index" />
      
      {/* Section Bienvenue */}
      <section className="welcome-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right" data-aos-duration="800">
              <div className="image-container position-relative">
                <img src="assets/pic.jpeg" alt="Mon Miam Miam" className="welcome-img img-fluid" onError={(e) => {e.target.onerror = null; e.target.style.display='none'}} />
                <div className="floating-elements">
                  <div className="floating-element element-1">
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div className="floating-element element-2">
                    <i className="fas fa-hamburger"></i>
                  </div>
                  <div className="floating-element element-3">
                    <i className="fas fa-pizza-slice"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center text-lg-start" data-aos="fade-left" data-aos-duration="800" data-aos-delay="200">
              <h1 className="welcome-title display-4 fw-bold mb-3">
                Bienvenue sur <span className="brand-highlight">Mon Miam Miam</span>
              </h1>
              <h2 className="welcome-subtitle h3 mb-4">
                Votre espace employé dédié
              </h2>
              
              <p className="lead text-muted mb-4" data-aos="fade-up" data-aos-delay="400">
                Gérez efficacement votre restaurant avec nos outils intuitifs et performants. 
                Commandes, statistiques, menu et réclamations, tout est centralisé pour votre confort.
              </p>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mt-4">
                <a href="/gestion" className="btn btn-orange" data-aos="zoom-in" data-aos-delay="600">
                  <i className="fas fa-utensils me-2"></i>Gérer le menu
                </a>
                <a href="/commandes" className="btn btn-white" data-aos="zoom-in" data-aos-delay="800">
                  <i className="fas fa-shopping-cart me-2"></i>Voir les commandes
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="features-section py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12" data-aos="fade-up">
              <h2 className="section-title mb-3">Fonctionnalités Principales</h2>
              <p className="section-subtitle text-muted">Découvrez tous les outils à votre disposition</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-card text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <h4 className="feature-title">Gestion des Commandes</h4>
                <p className="feature-description text-muted">
                  Suivez et gérez toutes les commandes en temps réel avec notre interface intuitive.
                </p>
                <a href="/commandes" className="feature-link">
                  Explorer <i className="fas fa-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-card text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h4 className="feature-title">Statistiques Détaillées</h4>
                <p className="feature-description text-muted">
                  Analysez vos performances avec des graphiques et rapports détaillés.
                </p>
                <a href="/stats" className="feature-link">
                  Explorer <i className="fas fa-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-card text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-utensils"></i>
                </div>
                <h4 className="feature-title">Gestion du Menu</h4>
                <p className="feature-description text-muted">
                  Modifiez et organisez votre menu facilement avec notre éditeur visuel.
                </p>
                <a href="/gestion" className="feature-link">
                  Explorer <i className="fas fa-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="400">
              <div className="feature-card text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-comments"></i>
                </div>
                <h4 className="feature-title">Gestion des Réclamations</h4>
                <p className="feature-description text-muted">
                  Traitez les retours clients rapidement et efficacement.
                </p>
                <a href="/reclamations" className="feature-link">
                  Explorer <i className="fas fa-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques Rapides */}
      <section className="stats-preview-section py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12" data-aos="fade-up">
              <h2 className="section-title mb-3">Aperçu en Temps Réel</h2>
              <p className="section-subtitle text-muted">Vos indicateurs de performance actuels</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="100">
              <div className="stat-preview-card text-center">
                <div className="stat-icon mb-2">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="stat-number" id="live-orders">0</div>
                <div className="stat-label">Commandes Aujourd'hui</div>
              </div>
            </div>
            
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-preview-card text-center">
                <div className="stat-icon mb-2">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-number" id="active-customers">0</div>
                <div className="stat-label">Clients Actifs</div>
              </div>
            </div>
            
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-preview-card text-center">
                <div className="stat-icon mb-2">
                  <i className="fas fa-utensils"></i>
                </div>
                <div className="stat-number" id="menu-items">0</div>
                <div className="stat-label">Plats au Menu</div>
              </div>
            </div>
            
            <div className="col-md-3" data-aos="fade-up" data-aos-delay="400">
              <div className="stat-preview-card text-center">
                <div className="stat-icon mb-2">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-number" id="satisfaction-rate">0%</div>
                <div className="stat-label">Satisfaction Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Accueil;