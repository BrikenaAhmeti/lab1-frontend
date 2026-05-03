import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DoctorFormPage from '@/pages/Dashboard/doctors/form';

const mockUseDoctor = vi.fn();
const mockUseCreateDoctor = vi.fn();
const mockUseUpdateDoctor = vi.fn();
const mockUseDepartments = vi.fn();
const mockUseUsers = vi.fn();

vi.mock('@/domain/doctors/doctors.hooks', () => ({
  useDoctor: (id: string) => mockUseDoctor(id),
  useCreateDoctor: () => mockUseCreateDoctor(),
  useUpdateDoctor: () => mockUseUpdateDoctor(),
}));

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
}));

vi.mock('@/hooks/useUsers', () => ({
  useUsers: (options?: { enabled?: boolean }) => mockUseUsers(options),
}));

const createDoctorMock = vi.fn();

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
        <Routes>
          <Route path="/app/doctors/new" element={<DoctorFormPage />} />
          <Route path="/app/doctors/:id" element={<div>Doctor details</div>} />
          <Route path="/app/doctors/:id/edit" element={<DoctorFormPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('DoctorFormPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    createDoctorMock.mockReset();
    createDoctorMock.mockResolvedValue({ id: 'doctor-1' });

    mockUseDoctor.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCreateDoctor.mockReturnValue({
      mutateAsync: createDoctorMock,
      isPending: false,
    });

    mockUseUpdateDoctor.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
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

    mockUseUsers.mockReturnValue({
      data: [
        {
          id: 'user-1',
          firstName: 'Ava',
          lastName: 'Taylor',
          email: 'ava@example.com',
          phoneNumber: null,
          emailConfirmed: true,
          isActive: true,
          lockoutEnabled: false,
          accessFailedCount: 0,
          roles: ['DOCTOR'],
          createdAt: '2026-04-16T00:00:00.000Z',
          updatedAt: '2026-04-16T00:00:00.000Z',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('shows a forbidden state for non-admin create attempts', () => {
    renderPage('/app/doctors/new', ['STAFF']);

    expect(screen.getByText('Admin access required')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save doctor/i })).not.toBeInTheDocument();
  });

  it('submits the create form for admins', async () => {
    renderPage('/app/doctors/new', ['ADMIN']);

    fireEvent.change(screen.getByLabelText('User account'), {
      target: { value: 'user-1' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'dep-1' },
    });
    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: ' Ava ' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: ' Taylor ' },
    });
    fireEvent.change(screen.getByLabelText('Specialization'), {
      target: { value: ' Cardiology ' },
    });
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '+38344111222' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save doctor/i }));

    await waitFor(() => {
      expect(createDoctorMock).toHaveBeenCalledWith({
        userId: 'user-1',
        firstName: 'Ava',
        lastName: 'Taylor',
        specialization: 'Cardiology',
        departmentId: 'dep-1',
        phoneNumber: '+38344111222',
      });
    });
  });
});
