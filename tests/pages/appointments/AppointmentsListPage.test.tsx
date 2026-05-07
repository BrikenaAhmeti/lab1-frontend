import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppointmentsListPage from '@/pages/Dashboard/appointments';

const mockUseAppointments = vi.fn();
const mockUseCancelAppointment = vi.fn();
const mockUseDoctors = vi.fn();
const mockUsePatients = vi.fn();
const mockUsePatient = vi.fn();

vi.mock('@/domain/appointments/appointments.hooks', () => ({
  useAppointments: () => mockUseAppointments(),
  useCancelAppointment: () => mockUseCancelAppointment(),
}));

vi.mock('@/domain/doctors/doctors.hooks', () => ({
  useDoctors: () => mockUseDoctors(),
}));

vi.mock('@/domain/patients/patients.hooks', () => ({
  usePatients: () => mockUsePatients(),
  usePatient: (id: string) => mockUsePatient(id),
}));

describe('AppointmentsListPage', () => {
  const cancelMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cancelMock.mockReset();
    cancelMock.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    mockUseAppointments.mockReturnValue({
      data: [
        {
          id: 'appointment-1',
          patientId: 'patient-1',
          doctorId: 'doctor-1',
          appointmentDate: '2099-10-10T00:00:00.000Z',
          appointmentTime: '10:00',
          status: 'Scheduled',
          notes: 'Bring reports',
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
          createdAt: '2099-10-01T10:00:00.000Z',
          updatedAt: '2099-10-01T10:00:00.000Z',
        },
        {
          id: 'appointment-2',
          patientId: 'patient-2',
          doctorId: 'doctor-1',
          appointmentDate: '2099-10-11T00:00:00.000Z',
          appointmentTime: '11:00',
          status: 'Completed',
          notes: null,
          patient: {
            id: 'patient-2',
            firstName: 'Noah',
            lastName: 'Stone',
          },
          doctor: {
            id: 'doctor-1',
            firstName: 'Ava',
            lastName: 'Taylor',
            specialization: 'Cardiology',
          },
          createdAt: '2099-10-01T10:00:00.000Z',
          updatedAt: '2099-10-01T10:00:00.000Z',
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCancelAppointment.mockReturnValue({
      mutateAsync: cancelMock,
      isPending: false,
      variables: null,
    });

    mockUseDoctors.mockReturnValue({
      data: [
        {
          id: 'doctor-1',
          userId: 'user-1',
          firstName: 'Ava',
          lastName: 'Taylor',
          specialization: 'Cardiology',
          departmentId: 'department-1',
          phoneNumber: '+38344111222',
          department: {
            id: 'department-1',
            name: 'Cardiology',
            location: 'Floor 2',
          },
        },
      ],
      isLoading: false,
      error: null,
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
        ],
      },
      isLoading: false,
      error: null,
    });

    mockUsePatient.mockReturnValue({
      data: null,
    });
  });

  it('renders appointments and disables cancelling locked items', async () => {
    render(
      <MemoryRouter initialEntries={['/app/appointments']}>
        <AppointmentsListPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Lena Morris')).toBeInTheDocument();
    expect(screen.getByText('Noah Stone')).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel Appointment' });

    expect(cancelButtons[0]).toBeEnabled();
    expect(cancelButtons[1]).toBeDisabled();

    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(cancelMock).toHaveBeenCalledWith('appointment-1');
    });

    expect(screen.getByText('Appointment cancelled successfully.')).toBeInTheDocument();
  });
});
