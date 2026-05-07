import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoomsListPage from '@/pages/Dashboard/rooms';

const mockUseRooms = vi.fn();
const mockUseDeleteRoom = vi.fn();
const mockUseDepartments = vi.fn();

vi.mock('@/domain/rooms/rooms.hooks', () => ({
  useRooms: (params?: { departmentId?: string; type?: string; onlyAvailable?: boolean }) =>
    mockUseRooms(params),
  useDeleteRoom: () => mockUseDeleteRoom(),
}));

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
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
        <RoomsListPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('RoomsListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockUseRooms.mockReturnValue({
      data: [
        {
          id: 'room-1',
          roomNumber: '101',
          departmentId: 'dep-1',
          type: 'GENERAL',
          status: 'AVAILABLE',
          capacity: 3,
          activeAdmissionsCount: 2,
          availableCapacity: 1,
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

    mockUseDeleteRoom.mockReturnValue({
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
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('passes selected filters to the rooms query', () => {
    renderPage('/app/rooms?departmentId=dep-1&type=ICU&availability=available', ['ADMIN']);

    expect(mockUseRooms).toHaveBeenCalledWith({
      departmentId: 'dep-1',
      type: 'ICU',
      onlyAvailable: true,
    });
    expect(screen.getByLabelText('Department')).toHaveValue('dep-1');
    expect(screen.getByLabelText('Type')).toHaveValue('ICU');
  });

  it('renders room status and availability details', () => {
    renderPage('/app/rooms', ['ADMIN']);

    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Occupied: 2 / 3')).toBeInTheDocument();
    expect(screen.getByText('Available: 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
  });

  it('hides admin actions for non-admin users', () => {
    renderPage('/app/rooms', ['DOCTOR']);

    expect(screen.queryByRole('button', { name: /create room/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
  });
});
