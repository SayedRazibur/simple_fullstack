// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store/authStore';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdminMode = false,
  redirectTo = '/auth/login',
  fallback = null,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
  const location = useLocation();

  // if (isLoading) {
  //   return (
  //     fallback || (
  //       <div className="flex justify-center items-center min-h-64">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //       </div>
  //     )
  //   );
  // }

  // Redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect to dashboard if trying to access login while authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check admin mode requirement
  if (requireAuth && requireAdminMode && !isAdmin) {
    // Redirect to admin code entry page if admin mode is required but not active
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
