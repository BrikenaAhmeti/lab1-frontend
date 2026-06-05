import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdmissionsPage from '@/pages/Dashboard/admissions';

const mockUseAdmissions = vi.fn();
const mockUseCreateAdmission = vi.fn();
const mockUseDischargeAdmission = vi.fn();
const mockUsePatients = vi.fn();
const mockUseRooms = vi.fn();

vi.mock('@/domain/admissions/admissions.hooks', () => ({
  useAdmissions: (params?: { status?: string; date?: string; from?: string; to?: string }) =>
    mockUseAdmissions(params),
  useCreateAdmission: () => mockUseCreateAdmission(),
  useDischargeAdmission: () => mockUseDischargeAdmission(),
}));

vi.mock('@/domain/patients/patients.hooks', () => ({
  usePatients: (params?: { page?: number; limit?: number; search?: string }) =>
    mockUsePatients(params),
}));

vi.mock('@/domain/rooms/rooms.hooks', () => ({
  useRooms: () => mockUseRooms(),
}));

describe('AdmissionsPage', () => {
  const createAdmissionMock = vi.fn();
  const dischargeAdmissionMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    createAdmissionMock.mockReset();
    dischargeAdmissionMock.mockReset();
    createAdmissionMock.mockResolvedValue({ id: 'admission-3' });
    dischargeAdmissionMock.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    mockUseAdmissions.mockReturnValue({
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
            department: {
              id: 'dep-1',
              name: 'Cardiology',
              location: 'Floor 2',
            },
          },
        },
        {
          id: 'admission-2',
          patientId: 'patient-2',
          roomId: 'room-3',
          status: 'DISCHARGED',
          admissionDate: '2099-10-09T00:00:00.000Z',
          patient: {
            id: 'patient-2',
            firstName: 'Noah',
            lastName: 'Stone',
          },
          room: {
            id: 'room-3',
            roomNumber: '303',
            department: {
              id: 'dep-3',
              name: 'Pediatrics',
              location: 'Floor 1',
            },
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCreateAdmission.mockReturnValue({
      mutateAsync: createAdmissionMock,
      isPending: false,
    });

    mockUseDischargeAdmission.mockReturnValue({
      mutateAsync: dischargeAdmissionMock,
      isPending: false,
      variables: null,
    });

    mockUsePatients.mockReturnValue({
      data: {
        items: [
          {
            id: 'patient-1',
            firstName: 'Lena',
            lastName: 'Morris',
            dateOfBirth: '1990-01-01',
            gender: 'FEMALE',
            phoneNumber: '+38344111111',
            address: 'Street 1',
            bloodType: 'A+',
          },
          {
            id: 'patient-2',
            firstName: 'Noah',
            lastName: 'Stone',
            dateOfBirth: '1992-01-01',
            gender: 'MALE',
            phoneNumber: '+38344111112',
            address: 'Street 2',
            bloodType: 'B+',
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

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
          type: 'SURGERY',
          status: 'OCCUPIED',
          capacity: 2,
          activeAdmissionsCount: 2,
          availableCapacity: 0,
          department: {
            id: 'dep-2',
            name: 'Surgery',
            location: 'Floor 3',
          },
        },
        {
          id: 'room-3',
          roomNumber: '303',
          departmentId: 'dep-3',
          type: 'PEDIATRIC',
          status: 'UNDER_MAINTENANCE',
          capacity: 4,
          activeAdmissionsCount: 0,
          availableCapacity: 4,
          department: {
            id: 'dep-3',
            name: 'Pediatrics',
            location: 'Floor 1',
          },
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('passes status and date range filters to the admissions query and disables unavailable rooms', () => {
    render(
      <MemoryRouter initialEntries={['/app/admissions?status=ACTIVE&from=2099-10-01&to=2099-10-31']}>
        <AdmissionsPage />
      </MemoryRouter>
    );

    expect(mockUseAdmissions).toHaveBeenCalledWith({
      status: 'ACTIVE',
      from: '2099-10-01',
      to: '2099-10-31',
    });
    expect(screen.getByDisplayValue('2099-10-01 - 2099-10-31')).toBeInTheDocument();

    const roomSelect = screen.getByLabelText('Room') as HTMLSelectElement;
    const fullRoomOption = roomSelect.querySelector('option[value="room-2"]');
    const maintenanceRoomOption = roomSelect.querySelector('option[value="room-3"]');

    expect((fullRoomOption as HTMLOptionElement).disabled).toBe(true);
    expect((maintenanceRoomOption as HTMLOptionElement).disabled).toBe(true);
  });

  it('submits a new admission and allows discharging active items', async () => {
    render(
      <MemoryRouter initialEntries={['/app/admissions']}>
        <AdmissionsPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Patient'), {
      target: { value: 'patient-1' },
    });
    fireEvent.change(screen.getByLabelText('Room'), {
      target: { value: 'room-1' },
    });
    fireEvent.change(document.getElementById('admissionDate') as HTMLInputElement, {
      target: { value: '2099-10-11' },
    });

    fireEvent.click(screen.getByRole('button', { name: /admit patient/i }));

    await waitFor(() => {
      expect(createAdmissionMock).toHaveBeenCalledWith({
        patientId: 'patient-1',
        roomId: 'room-1',
        admissionDate: '2099-10-11',
      });
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^Discharge$/i })[0]);

    await waitFor(() => {
      expect(dischargeAdmissionMock).toHaveBeenCalledWith('admission-1');
    });
  });
});
