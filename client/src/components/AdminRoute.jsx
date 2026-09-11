import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection wrapper for administrator pages.
 * - Redirects unauthenticated users to /login
 * - Redirects ordinary students (non-admins) to /dashboard
 * - Renders children for authenticated administrators
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
