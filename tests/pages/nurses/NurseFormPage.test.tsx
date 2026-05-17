import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NurseFormPage from '@/pages/Dashboard/nurses/form';

const nurseTranslations = {
  'actions.save': 'Save nurse',
  'fields.userId': 'User account',
  'fields.firstName': 'First name',
  'fields.lastName': 'Last name',
  'fields.department': 'Department',
  'fields.shift': 'Shift',
  'fields.email': 'Email',
  'fields.username': 'Username',
  'fields.password': 'Password',
  'form.createNewLinkedUser': 'Create new linked user',
  'validation.required': 'This field is required.',
  'validation.email': 'Enter a valid email address.',
  'validation.username': 'Username must be at least 3 characters.',
  'validation.password': 'Password must be at least 6 characters.',
};

const mockUseNurse = vi.fn();
const mockUseCreateNurse = vi.fn();
const mockUseUpdateNurse = vi.fn();
const mockUseDepartments = vi.fn();
const mockUseUsers = vi.fn();

vi.mock('@/domain/nurses/nurses.hooks', () => ({
  useNurse: (id: string) => mockUseNurse(id),
  useCreateNurse: () => mockUseCreateNurse(),
  useUpdateNurse: () => mockUseUpdateNurse(),
}));

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
}));

vi.mock('@/hooks/useUsers', () => ({
  useUsers: (options?: { enabled?: boolean }) => mockUseUsers(options),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => nurseTranslations[key as keyof typeof nurseTranslations] ?? key,
  }),
}));

const createNurseMock = vi.fn();

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
        <Routes>
          <Route path="/app/nurses/new" element={<NurseFormPage />} />
          <Route path="/app/nurses/:id" element={<div>Nurse details</div>} />
          <Route path="/app/nurses/:id/edit" element={<NurseFormPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('NurseFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createNurseMock.mockReset();
    createNurseMock.mockResolvedValue({ id: 'nurse-1' });

    mockUseNurse.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCreateNurse.mockReturnValue({
      mutateAsync: createNurseMock,
      isPending: false,
    });

    mockUseUpdateNurse.mockReturnValue({
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
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('submits the create form with trimmed values', async () => {
    renderPage('/app/nurses/new');

    fireEvent.change(screen.getByLabelText('User account'), {
      target: { value: 'user-1' },
    });

    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: ' Ava ' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: ' Taylor ' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'dep-1' },
    });
    fireEvent.change(screen.getByLabelText('Shift'), {
      target: { value: 'Night' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save nurse/i }));

    await waitFor(() => {
      expect(createNurseMock).toHaveBeenCalledWith({
        userId: 'user-1',
        firstName: 'Ava',
        lastName: 'Taylor',
        departmentId: 'dep-1',
        shift: 'Night',
      });
    });
  });

  it('submits create nurse with new linked user fields only', async () => {
    renderPage('/app/nurses/new');

    fireEvent.click(screen.getByLabelText('Create new linked user'));
    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: ' Ava ' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: ' Taylor ' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'dep-1' },
    });
    fireEvent.change(screen.getByLabelText('Shift'), {
      target: { value: 'Night' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: ' ava@example.com ' },
    });
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: ' avataylor ' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: ' secret123 ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save nurse/i }));

    await waitFor(() => {
      expect(createNurseMock).toHaveBeenCalledWith({
        firstName: 'Ava',
        lastName: 'Taylor',
        departmentId: 'dep-1',
        shift: 'Night',
        email: 'ava@example.com',
        username: 'avataylor',
        password: 'secret123',
      });
    });
  });

  it('shows validation messages for invalid optional new linked user inputs', async () => {
    renderPage('/app/nurses/new');

    fireEvent.click(screen.getByLabelText('Create new linked user'));
    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: 'Ava' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: 'Taylor' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'dep-1' },
    });
    fireEvent.change(screen.getByLabelText('Shift'), {
      target: { value: 'Night' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bad-email' },
    });
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'ab' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save nurse/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Username must be at least 3 characters.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
    expect(createNurseMock).not.toHaveBeenCalled();
  });
});
