import '@/config/i18n';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoomsListPage from './index';

const mockUseRooms = vi.fn();
const mockUseDepartments = vi.fn();
const mockUseDeleteRoom = vi.fn();

vi.mock('@/domain/rooms/rooms.hooks', () => ({
  useRooms: (params?: { departmentId?: string; type?: string; onlyAvailable?: boolean }) =>
    mockUseRooms(params),
  useDeleteRoom: () => mockUseDeleteRoom(),
}));

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
}));

function renderPage(route: string) {
  const preloadedState = {
    auth: {
      user: {
        id: 'u-1',
        firstName: 'Ava',
        lastName: 'Taylor',
        email: 'ava@example.com',
        phoneNumber: null,
        emailConfirmed: true,
        isActive: true,
        lockoutEnabled: false,
        accessFailedCount: 0,
        roles: ['ADMIN'],
        createdAt: '2026-04-16T00:00:00.000Z',
        updatedAt: '2026-04-16T00:00:00.000Z',
      },
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
        {
          id: 'room-2',
          roomNumber: '202',
          departmentId: 'dep-2',
          type: 'ICU',
          status: 'OCCUPIED',
          capacity: 1,
          activeAdmissionsCount: 1,
          availableCapacity: 0,
          department: {
            id: 'dep-2',
            name: 'Neurology',
            location: 'Floor 4',
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
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

    mockUseDeleteRoom.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      variables: null,
    });
  });

  it('filters visible rooms by the search query', () => {
    renderPage('/app/rooms?q=202');

    expect(mockUseRooms).toHaveBeenCalledWith({
      departmentId: '',
      type: '',
      onlyAvailable: false,
    });
    expect(screen.getByLabelText('Search')).toHaveValue('202');
    expect(screen.getByText('202')).toBeInTheDocument();
    expect(screen.queryByText('101')).not.toBeInTheDocument();
    expect(screen.getByText('1 rooms')).toBeInTheDocument();
  });
});
