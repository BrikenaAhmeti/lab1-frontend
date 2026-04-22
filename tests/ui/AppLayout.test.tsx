import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppLayout from '@/ui/layouts/AppLayout';

vi.mock('@/domain/auth/auth.thunks', () => ({
  logout: () => ({ type: 'auth/logout' }),
}));

const createUser = (roles: string[]) => ({
  id: 'u-1',
  firstName: 'Ava',
  lastName: 'Taylor',
  email: 'ava@example.com',
  phoneNumber: null,
  emailConfirmed: true,
  isActive: true,
  lockoutEnabled: false,
  accessFailedCount: 0,
  roles,
  createdAt: '2026-04-16T00:00:00.000Z',
  updatedAt: '2026-04-16T00:00:00.000Z',
});

type RenderOptions = {
  roles?: string[];
  route?: string;
};

function renderLayout({ roles = ['STAFF'], route = '/app' }: RenderOptions = {}) {
  const preloadedState = {
    auth: {
      user: createUser(roles),
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      finishedGetStarted: false,
      loading: false,
      initialized: true,
      error: null,
    },
    transactions: {
      page: null,
      byId: {},
      loading: false,
      error: undefined,
    },
    authChat: {
      chatId: null,
      messages: [],
      loading: false,
      error: null,
    },
  };

  const store = configureStore({
    reducer: {
      auth: (state = preloadedState.auth) => state,
      transactions: (state = preloadedState.transactions) => state,
      authChat: (state = preloadedState.authChat) => state,
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<div>Index content</div>} />
            <Route path="patients" element={<div>Patients content</div>} />
            <Route path="transactions" element={<div>Transactions content</div>} />
            <Route path="admin" element={<div>Admin content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders outlet content with the primary shell controls', () => {
    renderLayout({ route: '/app/patients' });

    expect(screen.getByText('Patients content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByText('MEDSPHERE')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });

  it('keeps the same single-sidebar layout for admin roles', () => {
    const initialRender = renderLayout({ route: '/app/patients' });
    expect(screen.queryByText(/Security and permission monitoring enabled/i)).not.toBeInTheDocument();
    initialRender.unmount();

    renderLayout({ roles: ['ADMIN'], route: '/app/patients' });
    expect(screen.queryByText(/Security and permission monitoring enabled/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Patients').length).toBeGreaterThan(0);
    expect(screen.getByText('Doctors')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
  });

  it('toggles mobile navigation state from the header button', () => {
    renderLayout({ route: '/app/patients' });

    const navToggle = screen.getByRole('button', { name: /open navigation/i });
    expect(navToggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(navToggle);

    expect(navToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('button', { name: /close navigation/i }).length).toBeGreaterThan(0);
  });
});
