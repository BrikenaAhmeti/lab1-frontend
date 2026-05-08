import { jsx as _jsx } from "react/jsx-runtime";
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
export default function AppProviders({ children }) {
    return (_jsx(LanguageProvider, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(ToastProvider, { children: _jsx(AuthProvider, { children: children }) }) }) }));
}
