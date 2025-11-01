import React from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Navigate, Outlet } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  // 🔓 PROTECTION DÉSACTIVÉE - Accès libre pour la démo
  return <Outlet />;
  
  /* CODE ORIGINAL COMMENTÉ:
  const { user, loading } = useAuth();

  if (loading) {
    // Affiche un indicateur de chargement pendant la vérification de la session
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirige vers la page de login si l'utilisateur n'est pas connecté
    return <Navigate to="/login" replace />;
  }

  // Affiche le contenu (ManagerLayout ou EmployeeLayout) si l'utilisateur est connecté
  return <Outlet />;
  */
};
