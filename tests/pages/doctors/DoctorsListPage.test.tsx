import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DoctorsListPage from '@/pages/Dashboard/doctors';

const mockUseDoctors = vi.fn();
const mockUseDeleteDoctor = vi.fn();

vi.mock('@/domain/doctors/doctors.hooks', () => ({
  useDoctors: () => mockUseDoctors(),
  useDeleteDoctor: () => mockUseDeleteDoctor(),
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

function renderPage(roles: string[]) {
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
      <MemoryRouter initialEntries={['/app/doctors']}>
        <DoctorsListPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('DoctorsListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockUseDoctors.mockReturnValue({
      data: [
        {
          id: 'doctor-1',
          userId: 'user-1',
          firstName: 'Ava',
          lastName: 'Taylor',
          specialization: 'Cardiology',
          departmentId: 'dep-1',
          phoneNumber: '+38344111222',
          department: {
            id: 'dep-1',
            name: 'Cardiology',
            location: 'Floor 2',
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseDeleteDoctor.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      variables: null,
    });
  });

  it('hides admin actions for non-admin users', () => {
    renderPage(['STAFF']);

    expect(screen.getByText('Ava Taylor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create doctor/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
  });

  it('shows create and delete actions for admins', () => {
    renderPage(['ADMIN']);

    expect(screen.getByRole('button', { name: /create doctor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });
});
