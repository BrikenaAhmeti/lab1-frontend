import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardHomePage from '@/pages/Dashboard/home';

const mockUseDashboardStats = vi.fn();
const mockUseDashboardTodayAppointments = vi.fn();
const mockUseDashboardActiveAdmissions = vi.fn();

vi.mock('@/domain/dashboard/dashboard.hooks', () => ({
  useDashboardStats: () => mockUseDashboardStats(),
  useDashboardTodayAppointments: () => mockUseDashboardTodayAppointments(),
  useDashboardActiveAdmissions: () => mockUseDashboardActiveAdmissions(),
}));

describe('DashboardHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDashboardStats.mockReturnValue({
      data: {
        appointmentsToday: 4,
        availableRooms: 12,
        admittedPatients: 7,
        totalPatients: 180,
        totalDoctors: 26,
        pendingInvoicesAmount: 920,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseDashboardTodayAppointments.mockReturnValue({
      data: [
        {
          id: 'appointment-1',
          patientId: 'patient-1',
          doctorId: 'doctor-1',
          appointmentDate: '2099-10-10T00:00:00.000Z',
          appointmentTime: '09:30',
          status: 'Scheduled',
          notes: null,
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
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseDashboardActiveAdmissions.mockReturnValue({
      data: [
        {
          id: 'admission-1',
          patientId: 'patient-2',
          roomId: 'room-1',
          status: 'ACTIVE',
          admissionDate: '2099-10-08T00:00:00.000Z',
          patient: {
            id: 'patient-2',
            firstName: 'Noah',
            lastName: 'Stone',
          },
          room: {
            id: 'room-1',
            roomNumber: 'A-201',
            department: {
              id: 'department-1',
              name: 'Cardiology',
              location: 'North Wing',
            },
          },
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders the summary cards and both live data sections', () => {
    render(
      <MemoryRouter>
        <DashboardHomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Hospital Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Live overview')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('180')).toBeInTheDocument();
    expect(screen.getByText(/920/)).toBeInTheDocument();
    expect(screen.getAllByText("Today's Appointments").length).toBeGreaterThan(0);
    expect(screen.getByText('Lena Morris')).toBeInTheDocument();
    expect(screen.getByText('Ava Taylor')).toBeInTheDocument();
    expect(screen.getByText('Noah Stone')).toBeInTheDocument();
    expect(screen.getByText('A-201 · Cardiology')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View appointments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View admissions' })).toBeInTheDocument();
  });
});
