import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { ToastProvider } from '@/app/contexts/ToastContext';
import { moduleConfigs } from '@/config/modules';
import ModulePage from './ModulePage';

vi.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      roles: ['ADMIN'],
    },
    can: () => true,
  }),
}));

function renderPage(moduleKey: keyof typeof moduleConfigs = 'patients') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  render(
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/${moduleConfigs[moduleKey].path}`]}>
            <ModulePage moduleKey={moduleKey} />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

async function fillPatientForm() {
  fireEvent.change(document.getElementById('firstName') as HTMLInputElement, {
    target: { value: 'John' },
  });
  fireEvent.change(document.getElementById('lastName') as HTMLInputElement, {
    target: { value: 'Doe' },
  });
  fireEvent.change(document.getElementById('dateOfBirth') as HTMLInputElement, {
    target: { value: '1990-05-12' },
  });
  fireEvent.click(screen.getByTestId('select-gender'));
  fireEvent.click(screen.getByRole('option', { name: /^Male$/i }));
  fireEvent.change(document.getElementById('phoneNumber') as HTMLInputElement, {
    target: { value: '+38344111222' },
  });
  fireEvent.click(screen.getByTestId('select-bloodType'));
  fireEvent.click(screen.getByRole('option', { name: /^O\+$/ }));
  fireEvent.change(document.getElementById('address') as HTMLTextAreaElement, {
    target: { value: 'Prishtina' },
  });
}

describe('ModulePage', () => {
  const patientListResponse = {
    data: [
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
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const originalService = moduleConfigs.patients.service;
  const originalReceptionistService = moduleConfigs.receptionists.service;

  beforeEach(() => {
    vi.clearAllMocks();

    moduleConfigs.patients.service = {
      list: vi.fn().mockResolvedValue(patientListResponse),
      get: vi.fn().mockResolvedValue(patientListResponse.data[0]),
      create: vi.fn().mockResolvedValue({ id: 'patient-2' }),
      update: vi.fn().mockResolvedValue({ id: 'patient-1' }),
      remove: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    moduleConfigs.patients.service = originalService;
    moduleConfigs.receptionists.service = originalReceptionistService;
  });

  it('creates receptionist accounts with the receptionist auth payload shape', async () => {
    moduleConfigs.receptionists.service = {
      list: vi.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
      get: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 'receptionist-1' }),
      update: vi.fn(),
      remove: vi.fn(),
    };

    renderPage('receptionists');

    expect(await screen.findByText('No data yet')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Create new' })[0]);
    fireEvent.change(document.getElementById('firstName') as HTMLInputElement, {
      target: { value: 'Lira' },
    });
    fireEvent.change(document.getElementById('lastName') as HTMLInputElement, {
      target: { value: 'Gashi' },
    });
    fireEvent.change(document.getElementById('email') as HTMLInputElement, {
      target: { value: 'lira@example.com' },
    });
    fireEvent.change(document.getElementById('username') as HTMLInputElement, {
      target: { value: 'lira.gashi' },
    });
    fireEvent.change(document.getElementById('password') as HTMLInputElement, {
      target: { value: 'Reception123!' },
    });
    fireEvent.change(document.getElementById('phoneNumber') as HTMLInputElement, {
      target: { value: '+38344111222' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(moduleConfigs.receptionists.service.create).toHaveBeenCalledWith({
        firstName: 'Lira',
        lastName: 'Gashi',
        email: 'lira@example.com',
        username: 'lira.gashi',
        password: 'Reception123!',
        phoneNumber: '+38344111222',
        emailConfirmed: false,
        lockoutEnabled: true,
        isActive: true,
      });
    });
  });

  it('shows friendly retry UI for network errors and recovers on retry', async () => {
    moduleConfigs.patients.service = {
      ...moduleConfigs.patients.service,
      list: vi
        .fn()
        .mockRejectedValueOnce({ message: 'Network Error', code: 'ERR_NETWORK' })
        .mockResolvedValue(patientListResponse),
    };

    renderPage();

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('We could not reach the server. Check your connection and try again.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Network Error')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows success toasts for create, update, and delete actions', async () => {
    renderPage();

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create new' }));
    await fillPatientForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(moduleConfigs.patients.service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-05-12',
          gender: 'MALE',
          phoneNumber: '+38344111222',
          bloodType: 'O+',
          address: 'Prishtina',
        })
      );
    });

    expect(await screen.findByText('Created successfully.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    await waitFor(() => {
      expect(document.getElementById('firstName')).toHaveValue('Jane');
    });
    fireEvent.change(document.getElementById('phoneNumber') as HTMLInputElement, {
      target: { value: '+38344999999' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(moduleConfigs.patients.service.update).toHaveBeenCalledWith(
        'patient-1',
        expect.objectContaining({
          phoneNumber: '+38344999999',
        })
      );
    });

    expect(await screen.findByText('Updated successfully.')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1]);

    await waitFor(() => {
      expect(moduleConfigs.patients.service.remove).toHaveBeenCalledWith('patient-1');
    });

    expect(await screen.findByText('Deleted successfully.')).toBeInTheDocument();
  });

  it('shows a friendly error toast when saving fails', async () => {
    moduleConfigs.patients.service = {
      ...moduleConfigs.patients.service,
      create: vi.fn().mockRejectedValue({ message: 'Network Error', code: 'ERR_NETWORK' }),
    };

    renderPage();

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create new' }));
    await fillPatientForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText('We could not reach the server. Check your connection and try again.')
    ).toBeInTheDocument();
  });

  it('shows the create action inside the empty state', async () => {
    moduleConfigs.patients.service = {
      ...moduleConfigs.patients.service,
      list: vi.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
    };

    renderPage();

    expect(await screen.findByText('No data yet')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Create new' }).length).toBeGreaterThan(1);
  });
});
