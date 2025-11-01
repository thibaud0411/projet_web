import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Nous allons créer ce fichier juste après

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="landing-box">
        {/* Vous pouvez mettre votre logo ici */}
        <h1 className="landing-title">
          Mon Miam Miam
        </h1>
        <p className="landing-subtitle">
          Veuillez sélectionner votre espace de connexion
        </p>

        <div className="landing-actions">
          <Link to="/manager" className="btn btn-primary btn-lg landing-btn">
            Espace Gérant
          </Link>
          
          <Link to="/employee" className="btn btn-secondary btn-lg landing-btn">
            Espace Employé
          </Link>
          
          <Link to="/student" className="btn btn-outline-secondary btn-lg landing-btn">
            Espace Étudiant
          </Link>
        </div>
      </div>
    </div>
  );
};