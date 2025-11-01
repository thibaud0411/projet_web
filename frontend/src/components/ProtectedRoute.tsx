import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isGerant } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', user, 'isAdmin:', isAdmin, 'isGerant:', isGerant);

  // Wait for auth check to complete
  if (loading) {
    console.log('ProtectedRoute: Still loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin/gerant role
  if (!user || (!isAdmin && !isGerant)) {
    console.log('ProtectedRoute: Access denied, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
