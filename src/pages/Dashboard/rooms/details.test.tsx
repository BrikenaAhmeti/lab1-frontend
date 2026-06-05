import '@/config/i18n';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoomDetailsPage from './details';

const mockUseRoom = vi.fn();
const mockUseAdmissions = vi.fn();

vi.mock('@/domain/rooms/rooms.hooks', () => ({
  useRoom: (id: string) => mockUseRoom(id),
}));

vi.mock('@/domain/admissions/admissions.hooks', () => ({
  useAdmissions: (params?: { status?: string; roomId?: string }) => mockUseAdmissions(params),
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
        <Routes>
          <Route path="/app/rooms/:id" element={<RoomDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('RoomDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRoom.mockReturnValue({
      data: {
        id: 'room-1',
        roomNumber: '101',
        departmentId: 'dep-1',
        type: 'GENERAL',
        status: 'OCCUPIED',
        capacity: 3,
        activeAdmissionsCount: 1,
        availableCapacity: 2,
        department: {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'Floor 2',
        },
        currentAdmissions: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseAdmissions.mockReturnValue({
      data: [
        {
          id: 'admission-1',
          roomId: 'room-1',
          patientId: 'patient-1',
          status: 'ACTIVE',
          admissionDate: '2099-10-10T00:00:00.000Z',
          patient: {
            id: 'patient-1',
            firstName: 'Lena',
            lastName: 'Morris',
          },
        },
        {
          id: 'admission-2',
          roomId: 'room-2',
          patientId: 'patient-2',
          status: 'ACTIVE',
          admissionDate: '2099-10-11T00:00:00.000Z',
          patient: {
            id: 'patient-2',
            firstName: 'Noah',
            lastName: 'Stone',
          },
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('loads active room admissions from the backend and shows the patients staying there', () => {
    renderPage('/app/rooms/room-1');

    expect(mockUseAdmissions).toHaveBeenCalledWith({
      status: 'ACTIVE',
      roomId: 'room-1',
    });
    expect(screen.getByText('Lena Morris')).toBeInTheDocument();
    expect(screen.queryByText('Noah Stone')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View patient' })).toBeInTheDocument();
  });
});
