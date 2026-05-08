import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import { applyTheme, getInitialTheme } from '@/config/theme';
import AppProviders from '@/hms/providers/AppProviders';
import App from './App';

applyTheme(getInitialTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
        <App />
    </AppProviders>
  </StrictMode>
);
