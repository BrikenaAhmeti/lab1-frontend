import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../contexts/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
