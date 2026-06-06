import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NursesListPage from '@/pages/Dashboard/nurses';

const mockUseNurses = vi.fn();
const mockUseDeleteNurse = vi.fn();
const mockUseDepartments = vi.fn();

vi.mock('@/domain/nurses/nurses.hooks', () => ({
  useNurses: (params?: { departmentId?: string; search?: string; shift?: string }) =>
    mockUseNurses(params),
  useDeleteNurse: () => mockUseDeleteNurse(),
}));

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
}));

function renderPage(route: string) {
  const preloadedState = {
    auth: {
      user: null,
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
        <NursesListPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('NursesListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseNurses.mockReturnValue({
      data: [
        {
          id: 'nurse-1',
          firstName: 'Ava',
          lastName: 'Taylor',
          departmentId: 'dep-1',
          shift: 'Morning',
          department: {
            id: 'dep-1',
            name: 'Cardiology',
            location: 'Floor 2',
          },
        },
        {
          id: 'nurse-2',
          firstName: 'Mia',
          lastName: 'Lopez',
          departmentId: 'dep-2',
          shift: 'Night',
          department: {
            id: 'dep-2',
            name: 'Emergency',
            location: 'Floor 1',
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseDeleteNurse.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      variables: null,
    });

    mockUseDepartments.mockReturnValue({
      data: [
        {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'Floor 2',
        },
        {
          id: 'dep-2',
          name: 'Emergency',
          location: 'Floor 1',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('passes selected search, department, and shift filters to the nurses query', () => {
    renderPage('/app/nurses?departmentId=dep-2&search=Mia&shift=Night');

    expect(mockUseNurses).toHaveBeenCalledWith({
      departmentId: 'dep-2',
      search: 'Mia',
      shift: 'Night',
    });
    expect(screen.getByLabelText('Search nurses')).toHaveValue('Mia');
    expect(screen.getByLabelText('Department')).toHaveValue('dep-2');
    expect(screen.getByLabelText('Shift')).toHaveValue('Night');
  });

  it('leaves shift filtering to the backend response', () => {
    renderPage('/app/nurses?shift=Night');

    expect(mockUseNurses).toHaveBeenCalledWith({
      departmentId: '',
      search: '',
      shift: 'Night',
    });
    expect(screen.getByText('Mia Lopez')).toBeInTheDocument();
    expect(screen.getByText('Ava Taylor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create nurse/i })).toBeInTheDocument();
  });
});
