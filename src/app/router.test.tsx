import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppRouter from './router';
import { AUTH_RETURN_TO_KEY } from '@/libs/app/navigation';

const authMock = vi.hoisted(() => ({
  value: {
    ready: true,
    isAuthenticated: false,
    user: { roles: ['ADMIN'] },
    can: () => true,
  },
}));

vi.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => authMock.value,
}));

vi.mock('@/ui/organisms/AppLayout', () => ({
  default: function MockAppLayout() {
    return <Outlet />;
  },
}));

vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (value: { en: string }) => value.en,
  }),
}));

vi.mock('@/pages/app/routes/LoginRoutePage', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    default: function MockLoginRoutePage() {
      return <div>Lazy login page</div>;
    },
  };
});

vi.mock('@/pages/app/routes/LandingRoutePage', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    default: function MockLandingRoutePage() {
      return <div>Lazy landing page</div>;
    },
  };
});

vi.mock('@/pages/app/ConfirmEmailPage', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    default: function MockConfirmEmailPage() {
      return <div>Lazy confirm email page</div>;
    },
  };
});

vi.mock('@/pages/app/routes/DashboardRoutePage', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    default: function MockDashboardRoutePage() {
      return <div>Lazy dashboard page</div>;
    },
  };
});

vi.mock('@/pages/app/routes/DoctorsRoutePage', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  return {
    default: function MockDoctorsRoutePage() {
      const location = useLocation();

      return <div>Lazy doctors page {`${location.pathname}${location.search}`}</div>;
    },
  };
});

describe('AppRouter', () => {
  beforeEach(() => {
    authMock.value = {
      ready: true,
      isAuthenticated: false,
      user: { roles: ['ADMIN'] },
      can: () => true,
    };
  });

  it('shows a suspense skeleton before a lazy route resolves', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByTestId('route-skeleton')).toBeInTheDocument();
    expect(await screen.findByText('Lazy login page')).toBeInTheDocument();
  });

  it('shows the public landing page for guest visits to /', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(await screen.findByText('Lazy landing page')).toBeInTheDocument();
  });

  it('shows the public confirm email page', async () => {
    render(
      <MemoryRouter initialEntries={['/confirm-email?token=abc']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(await screen.findByText('Lazy confirm email page')).toBeInTheDocument();
  });

  it('redirects authenticated login visits back to the requested app page', async () => {
    authMock.value = {
      ...authMock.value,
      isAuthenticated: true,
    };
    sessionStorage.setItem(AUTH_RETURN_TO_KEY, '/doctors?page=2&gender=FEMALE');

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(await screen.findByText('Lazy doctors page /doctors?page=2&gender=FEMALE')).toBeInTheDocument();
  });
});
