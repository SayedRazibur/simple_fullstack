import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { RouterProvider } from 'react-router';
import routes from './routes/routes';
import { ThemeProvider } from './providers/ThemeProvider';
import AuthProvider from './providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={routes} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  // </StrictMode>
);
