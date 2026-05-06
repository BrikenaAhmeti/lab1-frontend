import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MedicalRecordFormPage from '@/pages/Dashboard/medical-records/form';
const mockUseMedicalRecord = vi.fn();
const mockUseCreateMedicalRecord = vi.fn();
const mockUseUpdateMedicalRecord = vi.fn();
const mockUseDoctors = vi.fn();
const mockUsePatients = vi.fn();
const mockUsePatient = vi.fn();
vi.mock('@/domain/medical-records/medical-records.hooks', () => ({
    useMedicalRecord: (id) => mockUseMedicalRecord(id),
    useCreateMedicalRecord: () => mockUseCreateMedicalRecord(),
    useUpdateMedicalRecord: () => mockUseUpdateMedicalRecord(),
}));
vi.mock('@/domain/doctors/doctors.hooks', () => ({
    useDoctors: () => mockUseDoctors(),
}));
vi.mock('@/domain/patients/patients.hooks', () => ({
    usePatients: () => mockUsePatients(),
    usePatient: (id) => mockUsePatient(id),
}));
const createMedicalRecordMock = vi.fn();
const createUser = (roles) => ({
    id: 'user-1',
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
});
function renderPage(route, roles) {
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
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/app/medical-records/new", element: _jsx(MedicalRecordFormPage, {}) }), _jsx(Route, { path: "/app/medical-records/:id/edit", element: _jsx(MedicalRecordFormPage, {}) }), _jsx(Route, { path: "/app/medical-records", element: _jsx("div", { children: "Medical records" }) })] }) }) }));
}
describe('MedicalRecordFormPage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        createMedicalRecordMock.mockReset();
        createMedicalRecordMock.mockResolvedValue({ id: 'record-1', patientId: 'patient-1' });
        mockUseMedicalRecord.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseCreateMedicalRecord.mockReturnValue({
            mutateAsync: createMedicalRecordMock,
            isPending: false,
        });
        mockUseUpdateMedicalRecord.mockReturnValue({
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
        });
        mockUsePatient.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
    });
    it('shows a forbidden state for unauthorized create attempts', () => {
        renderPage('/app/medical-records/new?patientId=patient-1', ['NURSE']);
        expect(screen.getByText('Write access required')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /save record/i })).not.toBeInTheDocument();
    });
    it('submits a new medical record with trimmed values', async () => {
        renderPage('/app/medical-records/new?patientId=patient-1', ['DOCTOR']);
        fireEvent.change(screen.getByLabelText('Patient'), {
            target: { value: 'patient-1' },
        });
        fireEvent.change(screen.getByLabelText('Doctor'), {
            target: { value: 'doctor-1' },
        });
        fireEvent.change(screen.getByLabelText('Diagnosis'), {
            target: { value: ' Seasonal flu ' },
        });
        fireEvent.change(screen.getByLabelText('Record date'), {
            target: { value: '2026-05-01' },
        });
        fireEvent.change(screen.getByLabelText('Treatment'), {
            target: { value: ' Rest and fluids ' },
        });
        fireEvent.change(screen.getByLabelText('Prescription notes'), {
            target: { value: ' Paracetamol as needed ' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save record/i }));
        await waitFor(() => {
            expect(createMedicalRecordMock).toHaveBeenCalledWith({
                patientId: 'patient-1',
                doctorId: 'doctor-1',
                diagnosis: 'Seasonal flu',
                treatment: 'Rest and fluids',
                prescriptionsText: 'Paracetamol as needed',
                date: '2026-05-01',
            });
        });
    });
});
