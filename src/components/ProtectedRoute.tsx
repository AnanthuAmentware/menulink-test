
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: 'owner' | 'admin';
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-restaurant-burgundy" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect admin to admin panel, owners to dashboard
    const redirectPath = userRole === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
