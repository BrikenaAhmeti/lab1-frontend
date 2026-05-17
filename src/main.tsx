import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import '@/config/i18n.ts';
import { applyTheme, getInitialTheme } from '@/config/theme.ts';
import AppProviders from '@/app/providers/AppProviders.tsx';
import App from './App.tsx';

applyTheme(getInitialTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
        <App />
    </AppProviders>
  </StrictMode>
);
