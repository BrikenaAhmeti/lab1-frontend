import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AppRouter from './router';

vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    ready: true,
    isAuthenticated: false,
    can: () => true,
  }),
}));

vi.mock('./contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (value: { en: string }) => value.en,
  }),
}));

vi.mock('./pages/routes/LoginRoutePage', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    default: function MockLoginRoutePage() {
      return <div>Lazy login page</div>;
    },
  };
});

describe('AppRouter', () => {
  it('shows a suspense skeleton before a lazy route resolves', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByTestId('route-skeleton')).toBeInTheDocument();
    expect(await screen.findByText('Lazy login page')).toBeInTheDocument();
  });
});
