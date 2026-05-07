import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppointmentFormPage from '@/pages/Dashboard/appointments/form';
const mockUseAppointment = vi.fn();
const mockUseCreateAppointment = vi.fn();
const mockUseUpdateAppointment = vi.fn();
const mockUseDoctors = vi.fn();
const mockUsePatients = vi.fn();
const mockUsePatient = vi.fn();
vi.mock('@/domain/appointments/appointments.hooks', () => ({
    useAppointment: (id) => mockUseAppointment(id),
    useCreateAppointment: () => mockUseCreateAppointment(),
    useUpdateAppointment: () => mockUseUpdateAppointment(),
}));
vi.mock('@/domain/doctors/doctors.hooks', () => ({
    useDoctors: () => mockUseDoctors(),
}));
vi.mock('@/domain/patients/patients.hooks', () => ({
    usePatients: () => mockUsePatients(),
    usePatient: (id) => mockUsePatient(id),
}));
describe('AppointmentFormPage', () => {
    const createAppointmentMock = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        createAppointmentMock.mockReset();
        createAppointmentMock.mockResolvedValue({ id: 'appointment-1' });
        mockUseAppointment.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseCreateAppointment.mockReturnValue({
            mutateAsync: createAppointmentMock,
            isPending: false,
        });
        mockUseUpdateAppointment.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
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
            refetch: vi.fn(),
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
            refetch: vi.fn(),
        });
        mockUsePatient.mockReturnValue({
            data: null,
        });
    });
    it('submits a new appointment with trimmed values', async () => {
        render(_jsx(MemoryRouter, { initialEntries: ['/app/appointments/new'], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/app/appointments/new", element: _jsx(AppointmentFormPage, {}) }), _jsx(Route, { path: "/app/appointments/:id", element: _jsx("div", { children: "Appointment details" }) })] }) }));
        fireEvent.change(screen.getByLabelText('Patient'), {
            target: { value: 'patient-1' },
        });
        fireEvent.change(screen.getByLabelText('Doctor'), {
            target: { value: 'doctor-1' },
        });
        fireEvent.change(screen.getByLabelText('Date'), {
            target: { value: '2099-10-10' },
        });
        fireEvent.change(screen.getByLabelText('Time'), {
            target: { value: '10:30' },
        });
        fireEvent.change(screen.getByLabelText('Notes'), {
            target: { value: ' Bring reports ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save appointment' }));
        await waitFor(() => {
            expect(createAppointmentMock).toHaveBeenCalledWith({
                patientId: 'patient-1',
                doctorId: 'doctor-1',
                date: '2099-10-10',
                time: '10:30',
                notes: 'Bring reports',
            });
        });
    });
});
