import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrescriptionsPage from '@/pages/Dashboard/prescriptions';

const mockUsePatients = vi.fn();
const mockUsePatient = vi.fn();
const mockUseMedicalRecords = vi.fn();
const mockUseMedicalRecordPrescriptions = vi.fn();
const mockUseCreatePrescription = vi.fn();
const mockUseUpdatePrescription = vi.fn();
const mockUseDeletePrescription = vi.fn();

vi.mock('@/domain/patients/patients.hooks', () => ({
  usePatients: (params?: { page?: number; limit?: number; search?: string }) => mockUsePatients(params),
  usePatient: (id: string) => mockUsePatient(id),
}));

vi.mock('@/domain/medical-records/medical-records.hooks', () => ({
  useMedicalRecords: (patientId: string) => mockUseMedicalRecords(patientId),
  useMedicalRecordPrescriptions: (medicalRecordId: string) =>
    mockUseMedicalRecordPrescriptions(medicalRecordId),
  useCreatePrescription: () => mockUseCreatePrescription(),
  useUpdatePrescription: () => mockUseUpdatePrescription(),
  useDeletePrescription: () => mockUseDeletePrescription(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'actions.create': 'Create prescription',
        'actions.delete': 'Delete',
        'actions.edit': 'Edit',
        'actions.print': 'Print',
        'actions.save': 'Save prescription',
        'fields.dosage': 'Dosage',
        'fields.duration': 'Duration',
        'fields.instructions': 'Instructions',
        'fields.medicine': 'Medicine',
        'labels.viewOnly': 'View only',
      };

      return labels[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
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
        <PrescriptionsPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('PrescriptionsPage', () => {
  const createMutation = {
    mutateAsync: vi.fn().mockResolvedValue({ id: 'prescription-1', medicalRecordId: 'record-1' }),
    isPending: false,
  };
  const updateMutation = {
    mutateAsync: vi.fn().mockResolvedValue({ id: 'prescription-1', medicalRecordId: 'record-1' }),
    isPending: false,
  };
  const deleteMutation = {
    mutateAsync: vi.fn().mockResolvedValue('record-1'),
    isPending: false,
    variables: undefined,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    Object.defineProperty(window, 'print', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    mockUsePatients.mockReturnValue({
      data: {
        items: [
          {
            id: 'patient-1',
            firstName: 'Lena',
            lastName: 'Morris',
            phoneNumber: '+38344111222',
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUsePatient.mockReturnValue({
      data: {
        id: 'patient-1',
        firstName: 'Lena',
        lastName: 'Morris',
        phoneNumber: '+38344111222',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseMedicalRecords.mockReturnValue({
      data: [
        {
          id: 'record-1',
          patientId: 'patient-1',
          doctorId: 'doctor-1',
          diagnosis: 'Hypertension',
          treatment: 'Observation',
          prescriptionsText: null,
          recordDate: '2026-05-05',
          patient: {
            id: 'patient-1',
            firstName: 'Lena',
            lastName: 'Morris',
          },
          doctor: {
            id: 'doctor-1',
            firstName: 'Ava',
            lastName: 'Taylor',
            specialization: 'Cardiology',
          },
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseMedicalRecordPrescriptions.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCreatePrescription.mockReturnValue(createMutation);
    mockUseUpdatePrescription.mockReturnValue(updateMutation);
    mockUseDeletePrescription.mockReturnValue(deleteMutation);
  });

  it('creates a prescription for the selected medical record', async () => {
    renderPage('/app/prescriptions?patientId=patient-1&recordId=record-1', ['DOCTOR']);

    fireEvent.click(screen.getAllByRole('button', { name: /create prescription/i })[0]);
    fireEvent.change(screen.getByLabelText('Medicine'), { target: { value: 'Amoxicillin' } });
    fireEvent.change(screen.getByLabelText('Dosage'), { target: { value: '500mg' } });
    fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '5 days' } });
    fireEvent.change(screen.getByLabelText('Instructions'), {
      target: { value: 'After meals' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save prescription/i }));

    await waitFor(() => {
      expect(createMutation.mutateAsync).toHaveBeenCalledWith({
        medicalRecordId: 'record-1',
        medicine: 'Amoxicillin',
        dosage: '500mg',
        duration: '5 days',
        instructions: 'After meals',
      });
    });
  });

  it('shows printable view-only mode for receptionists', () => {
    mockUseMedicalRecordPrescriptions.mockReturnValue({
      data: [
        {
          id: 'prescription-1',
          medicalRecordId: 'record-1',
          medicine: 'Amlodipine',
          dosage: '5mg',
          duration: '30 days',
          instructions: 'Morning',
          createdAt: '2026-05-05T10:00:00.000Z',
          updatedAt: '2026-05-05T10:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage('/app/prescriptions?patientId=patient-1&recordId=record-1', ['RECEPTIONIST']);

    expect(screen.getByText('View only')).toBeInTheDocument();
    expect(screen.getByText('Amlodipine')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create prescription/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(window.print).toHaveBeenCalled();
  });
});
