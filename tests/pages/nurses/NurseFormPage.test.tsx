import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NurseFormPage from '@/pages/Dashboard/nurses/form';

const nurseTranslations = {
  'actions.save': 'Save nurse',
  'actions.update': 'Update nurse',
  'fields.firstName': 'First name',
  'fields.lastName': 'Last name',
  'fields.department': 'Department',
  'fields.shift': 'Shift',
  'fields.email': 'Email',
  'fields.username': 'Username',
  'form.accountReadOnlyHint': 'Email and username cannot be changed from nurse edit.',
  'validation.required': 'This field is required.',
  'validation.email': 'Enter a valid email address.',
  'validation.username': 'Username must be at least 3 characters.',
};

const mockUseNurse = vi.fn();
const mockUseCreateNurse = vi.fn();
const mockUseUpdateNurse = vi.fn();
const mockUseDepartments = vi.fn();

vi.mock('@/domain/nurses/nurses.hooks', () => ({
  useNurse: (id: string) => mockUseNurse(id),
  useCreateNurse: () => mockUseCreateNurse(),
  useUpdateNurse: () => mockUseUpdateNurse(),
}));

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => nurseTranslations[key as keyof typeof nurseTranslations] ?? key,
  }),
}));

const createNurseMock = vi.fn();
const updateNurseMock = vi.fn();

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
    updateNurseMock.mockReset();
    updateNurseMock.mockResolvedValue({ id: 'nurse-1' });

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
      mutateAsync: updateNurseMock,
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

  });

  it('submits the create form with trimmed account and nurse values', async () => {
    renderPage('/app/nurses/new');

    expect(screen.queryByLabelText('User account')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: ' ava@example.com ' },
    });
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: ' avataylor ' },
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
        email: 'ava@example.com',
        username: 'avataylor',
        firstName: 'Ava',
        lastName: 'Taylor',
        departmentId: 'dep-1',
        shift: 'Night',
      });
    });
  });

  it('shows validation messages for invalid account inputs', async () => {
    renderPage('/app/nurses/new');

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

    fireEvent.click(screen.getByRole('button', { name: /save nurse/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Username must be at least 3 characters.')).toBeInTheDocument();
    expect(createNurseMock).not.toHaveBeenCalled();
  });

  it('requires username when creating a nurse account', async () => {
    renderPage('/app/nurses/new');

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
      target: { value: 'ava@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save nurse/i }));

    expect(await screen.findByText('This field is required.')).toBeInTheDocument();
    expect(createNurseMock).not.toHaveBeenCalled();
  });

  it('disables email and username on edit and updates only nurse details', async () => {
    mockUseNurse.mockReturnValue({
      data: {
        id: 'nurse-1',
        userId: 'user-1',
        email: 'ava@example.com',
        username: 'avataylor',
        firstName: 'Ava',
        lastName: 'Taylor',
        departmentId: 'dep-1',
        shift: 'Morning',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage('/app/nurses/nurse-1/edit');

    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Username')).toBeDisabled();

    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: ' Ava-Lynn ' },
    });
    fireEvent.change(screen.getByLabelText('Shift'), {
      target: { value: 'Night' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update nurse/i }));

    await waitFor(() => {
      expect(updateNurseMock).toHaveBeenCalledWith({
        id: 'nurse-1',
        payload: {
          firstName: 'Ava-Lynn',
          lastName: 'Taylor',
          departmentId: 'dep-1',
          shift: 'Night',
        },
      });
    });
  });
});
