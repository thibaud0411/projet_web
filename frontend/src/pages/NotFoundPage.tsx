import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="fs-3">
          <span className="text-danger">Oups !</span> Page non trouvée.
        </p>
        <p className="lead">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          to="/manager/dashboard" 
          className="btn btn-primary" 
          style={{backgroundColor: '#cfbd97', borderColor: '#cfbd97', color: '#000'}}
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};