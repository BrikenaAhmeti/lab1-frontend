import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '@/libs/app/api';
import ConfirmEmailPage from './ConfirmEmailPage';

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ConfirmEmailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('confirms the email token and links back to login', async () => {
    const confirmSpy = vi.spyOn(authApi, 'confirmEmail').mockResolvedValue({});

    renderPage('/confirm-email?token=valid-token');

    expect(screen.getByText('Checking your email link')).toBeInTheDocument();

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith({ token: 'valid-token' });
    });

    expect(await screen.findByText('Your email is confirmed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to login/i })).toHaveAttribute('href', '/login');
  });

  it('shows the resend form when the token is missing', () => {
    const confirmSpy = vi.spyOn(authApi, 'confirmEmail').mockResolvedValue({});

    renderPage('/confirm-email');

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Confirmation token missing')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('allows a confirmation email to be resent after an expired token', async () => {
    vi.spyOn(authApi, 'confirmEmail').mockRejectedValue({
      response: { data: { message: 'Confirmation link expired.' } },
    });
    const resendSpy = vi.spyOn(authApi, 'resendConfirmationEmail').mockResolvedValue(undefined);

    renderPage('/confirm-email?token=expired-token');

    expect(await screen.findByText('This link did not work')).toBeInTheDocument();
    expect(screen.getByText('Confirmation link expired.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: ' ava@example.com ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /resend email/i }));

    await waitFor(() => {
      expect(resendSpy).toHaveBeenCalledWith({ email: 'ava@example.com' });
    });

    expect(
      await screen.findByText('If the email exists and is not confirmed, a new confirmation email has been sent.')
    ).toBeInTheDocument();
  });
});
