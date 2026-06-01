import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { ToastProvider } from '@/app/contexts/ToastContext';
import { authApi } from '@/libs/app/api';
import LoginPage from './LoginPage';

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows the rate-limit message for login 429 responses', async () => {
    vi.spyOn(authApi, 'refresh').mockRejectedValue(new Error('No session'));
    vi.spyOn(authApi, 'login').mockRejectedValue({
      response: {
        status: 429,
        data: {
          message: 'Too many login attempts, please try again in 15 minutes',
        },
      },
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('Email or username'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many login attempts, please try again in 15 minutes'
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
