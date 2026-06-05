import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { ToastProvider } from '@/app/contexts/ToastContext';
import { authApi } from '@/libs/app/api';
import LoginPage from './LoginPage';

function DestinationPage() {
  const location = useLocation();

  return <div>Destination {`${location.pathname}${location.search}`}</div>;
}

function renderPage(initialEntry = '/login') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/doctors" element={<DestinationPage />} />
            </Routes>
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

  it('returns to the requested app route after successful login', async () => {
    vi.spyOn(authApi, 'refresh').mockRejectedValue(new Error('No session'));
    vi.spyOn(authApi, 'login').mockResolvedValue({
      user: { id: '1', roles: ['ADMIN'] },
      accessToken: 'access-token',
    });

    renderPage('/login?returnTo=%2Fdoctors%3Fpage%3D2%26gender%3DFEMALE');

    fireEvent.change(screen.getByLabelText('Email or username'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Destination /doctors?page=2&gender=FEMALE')).toBeInTheDocument();
  });
});
