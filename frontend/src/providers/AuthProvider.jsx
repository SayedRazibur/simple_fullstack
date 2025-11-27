// providers/AuthProvider.jsx
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export const AuthProvider = ({ children }) => {
  const { validateAuth, isLoading } = useAuthStore();

  useEffect(() => {
    validateAuth();
  }, []);

  return children;
};

export default AuthProvider;
