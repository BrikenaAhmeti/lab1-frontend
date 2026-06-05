import '@/config/i18n';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientsListPage from './index';

const mockUsePatients = vi.fn();
const mockUseDeletePatient = vi.fn();

vi.mock('@/domain/patients/patients.hooks', () => ({
  usePatients: (params?: unknown) => mockUsePatients(params),
  useDeletePatient: () => mockUseDeletePatient(),
}));

function createUser(roles: string[]) {
  return {
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
  };
}

function renderPage(route: string, roles: string[]) {
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
        <PatientsListPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('PatientsListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockUsePatients.mockReturnValue({
      data: {
        items: [
          {
            id: 'patient-1',
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1991-03-12',
            gender: 'FEMALE',
            phoneNumber: '+38344111111',
            bloodType: 'A+',
            address: 'Main Street',
          },
        ],
        data: [],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseDeletePatient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      variables: null,
    });
  });

  it('normalizes lowercase gender URL filters before querying patients', () => {
    renderPage('/app/patients?search=Jane&gender=female', ['ADMIN']);

    expect(mockUsePatients).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'Jane',
      gender: 'FEMALE',
    });
    expect(screen.getByRole('combobox', { name: 'Gender' })).toHaveTextContent('Female');
  });
});
