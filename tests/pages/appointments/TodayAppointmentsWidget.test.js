import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TodayAppointmentsWidget from '@/pages/Dashboard/appointments/today-widget';
const mockUseTodayAppointments = vi.fn();
vi.mock('@/domain/appointments/appointments.hooks', () => ({
    useTodayAppointments: () => mockUseTodayAppointments(),
}));
describe('TodayAppointmentsWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTodayAppointments.mockReturnValue({
            data: [
                {
                    id: 'appointment-1',
                    patientId: 'patient-1',
                    doctorId: 'doctor-1',
                    appointmentDate: '2099-10-10T00:00:00.000Z',
                    appointmentTime: '09:00',
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
                {
                    id: 'appointment-2',
                    patientId: 'patient-2',
                    doctorId: 'doctor-2',
                    appointmentDate: '2099-10-10T00:00:00.000Z',
                    appointmentTime: '11:00',
                    status: 'Completed',
                    notes: null,
                    patient: {
                        id: 'patient-2',
                        firstName: 'Noah',
                        lastName: 'Stone',
                    },
                    doctor: {
                        id: 'doctor-2',
                        firstName: 'Mia',
                        lastName: 'Scott',
                        specialization: 'Neurology',
                    },
                    createdAt: '2099-10-01T10:00:00.000Z',
                    updatedAt: '2099-10-01T10:00:00.000Z',
                },
            ],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });
    it('shows today count and a short list', () => {
        render(_jsx(MemoryRouter, { children: _jsx(TodayAppointmentsWidget, {}) }));
        expect(screen.getByText('widget.title')).toBeInTheDocument();
        expect(screen.getByText('widget.countLabel')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Lena Morris')).toBeInTheDocument();
        expect(screen.getByText('Noah Stone')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'actions.viewToday' })).toBeInTheDocument();
    });
});
