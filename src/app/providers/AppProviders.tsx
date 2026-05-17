import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { ToastProvider } from '@/app/contexts/ToastContext';

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
    <Provider store={store}>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </Provider>
  );
}
