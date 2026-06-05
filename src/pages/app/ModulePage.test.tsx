import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { ToastProvider } from '@/app/contexts/ToastContext';
import { moduleConfigs } from '@/config/modules';
import { apiClient } from '@/libs/app/api';
import ModulePage from './ModulePage';

vi.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      roles: ['ADMIN'],
    },
    can: () => true,
  }),
}));

function renderPage(
  moduleKey: keyof typeof moduleConfigs = 'patients',
  route = `/${moduleConfigs[moduleKey].path}`
) {
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
          <MemoryRouter initialEntries={[route]}>
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
  const originalDepartmentsService = moduleConfigs.departments.service;
  const originalRoomsService = moduleConfigs.rooms.service;
  const originalAdmissionsService = moduleConfigs.admissions.service;
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
    vi.restoreAllMocks();
    moduleConfigs.patients.service = originalService;
    moduleConfigs.departments.service = originalDepartmentsService;
    moduleConfigs.rooms.service = originalRoomsService;
    moduleConfigs.admissions.service = originalAdmissionsService;
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

  it('opens a detail popup with the module get endpoint', async () => {
    renderPage();

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Details' }));

    await waitFor(() => {
      expect(moduleConfigs.patients.service.get).toHaveBeenCalledWith('patient-1');
    });

    expect(await screen.findByRole('heading', { name: 'Details: Patient' })).toBeInTheDocument();
    expect(screen.getByText('Main Street')).toBeInTheDocument();
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

  it('passes department search through the active departments module', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'North Wing',
          description: 'Heart care unit',
        },
        {
          id: 'dep-2',
          name: 'Neurology',
          location: 'East Clinic',
          description: 'Brain and nerve care',
        },
      ],
    });

    renderPage('departments', '/departments?search=brain');

    expect(await screen.findByText('Neurology')).toBeInTheDocument();
    expect(screen.queryByText('Cardiology')).not.toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith('/api/departments/all?sortBy=name&order=ASC');

    expect(screen.getByLabelText('Search departments')).toHaveAttribute(
      'placeholder',
      'Department, location, or description'
    );
  });

  it('passes room search through the active rooms module', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'Floor 2',
        },
      ],
    });

    moduleConfigs.rooms.service = {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'room-1',
            roomNumber: '101',
            department: {
              id: 'dep-1',
              name: 'Cardiology',
              location: 'Floor 2',
            },
            type: 'GENERAL',
            status: 'AVAILABLE',
            capacity: 3,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    renderPage('rooms', '/rooms?search=101');

    expect(await screen.findByText('101')).toBeInTheDocument();
    expect(moduleConfigs.rooms.service.list).toHaveBeenCalledWith(
      expect.objectContaining({
        search: '101',
        sortBy: 'roomNumber',
        order: 'ASC',
      })
    );
    expect(screen.getByLabelText('Search rooms')).toHaveAttribute('placeholder', 'Room number');
  });

  it('shows current room patients from admissions in room details', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'Floor 2',
        },
      ],
    });

    moduleConfigs.rooms.service = {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'room-1',
            roomNumber: '101',
            department: {
              id: 'dep-1',
              name: 'Cardiology',
              location: 'Floor 2',
            },
            type: 'GENERAL',
            status: 'OCCUPIED',
            capacity: 3,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
      get: vi.fn().mockResolvedValue({
        id: 'room-1',
        roomNumber: '101',
        department: {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'Floor 2',
        },
        type: 'GENERAL',
        status: 'OCCUPIED',
        capacity: 3,
      }),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    moduleConfigs.admissions.service = {
      ...moduleConfigs.admissions.service,
      list: vi.fn().mockResolvedValue({
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
        ],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      }),
    };

    renderPage('rooms');

    expect(await screen.findByText('101')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));

    await waitFor(() => {
      expect(moduleConfigs.admissions.service.list).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        status: 'ACTIVE',
        roomId: 'room-1',
      });
    });
    expect(await screen.findByText('Current patients')).toBeInTheDocument();
    expect(screen.getByText('Lena Morris')).toBeInTheDocument();
  });

  it('passes admission date filters and discharges active admissions', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });
    const putMock = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);

    moduleConfigs.admissions.service = {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'admission-1',
            patientId: 'patient-1',
            roomId: 'room-1',
            status: 'ACTIVE',
            admissionDate: '2099-10-10T00:00:00.000Z',
            patient: {
              id: 'patient-1',
              firstName: 'Lena',
              lastName: 'Morris',
            },
            room: {
              id: 'room-1',
              roomNumber: '101',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    renderPage('admissions', '/admissions?date=2099-10-10');

    expect(await screen.findByText('Lena Morris')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2099-10-10')).toBeInTheDocument();
    expect(moduleConfigs.admissions.service.list).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2099-10-10',
        sortBy: 'admissionDate',
        order: 'DESC',
      })
    );

    const dischargeButton = screen.getByRole('button', { name: 'Discharge' });
    expect(dischargeButton).toBeEnabled();
    fireEvent.click(dischargeButton);
    expect(confirmMock).toHaveBeenCalledWith('Discharge this patient?');

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith('/api/admissions/admission-1/discharge', {});
    });
  });
});
