// Error Pages
import Unauthorized from '@/pages/errors/Unauthorized';
import Forbidden from '@/pages/errors/Forbidden';
import NotFound from '@/pages/errors/NotFound';
import InternalServerError from '@/pages/errors/InternalServerError';
import Maintenance from '@/pages/errors/Maintenance';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

import Layout from '@/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/auth/Settings';
import { createBrowserRouter, Navigate } from 'react-router';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import OTP from '@/pages/auth/OTP';
import ResetPassword from '@/pages/auth/ResetPassword';
import DocumentScreen from '@/pages/Documents';
import ClientScreen from '@/pages/Clients';
import ReferenceData from '@/pages/ReferenceData';
import ReminderScreen from '@/pages/Reminders';
import SupplierScreen from '@/pages/Suppliers';
import ProductScreen from '@/pages/Products';
import OrderScreen from '@/pages/Orders';

// Define router
const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      { path: 'login', Component: Login },
      { path: 'signin', Component: Login },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'otp', Component: OTP },
      { path: 'reset-password', Component: ResetPassword },
    ],
  },
  {
    path: '/',
    // errorElement: <NotFound />,
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      { path: 'documents', Component: DocumentScreen },
      { path: 'reminder', Component: ReminderScreen },
      { path: 'crm', Component: ClientScreen },
      { path: 'suppliers', Component: SupplierScreen },
      { path: 'products', Component: ProductScreen },
      { path: 'orders', Component: OrderScreen },
      { path: 'dashboard/*', Component: Dashboard },

      { path: 'reference-data/', Component: ReferenceData },
      {
        path: '/settings',
        element: (
          <ProtectedRoute requireAdminMode={true}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/unauthorized',
    Component: Unauthorized,
  },
  {
    path: '/forbidden',
    Component: Forbidden,
  },
  {
    path: '/server-error',
    Component: InternalServerError,
  },
  {
    path: '/maintenance',
    Component: Maintenance,
  },
  {
    path: '/404',
    Component: NotFound,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);

export default router;
