import type { ReactNode } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 🔓 PROTECTION DÉSACTIVÉE - Accès libre à toutes les pages pour la démo
  return <>{children}</>;
  
  // Le code ci-dessous est commenté pour le mode démo
  // Pour réactiver la protection, décommentez tout et retirez la ligne au-dessus
  /*
  const { user, loading, isAdmin, isGerant } = useAuth();

  // Wait for auth check to complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin/gerant role
  if (!user || (!isAdmin && !isGerant)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
  */
};

export default ProtectedRoute;
