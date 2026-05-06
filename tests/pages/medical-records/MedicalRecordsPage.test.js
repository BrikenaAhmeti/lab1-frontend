import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MedicalRecordsListPage from '@/pages/Dashboard/medical-records';
const mockUsePatients = vi.fn();
const mockUsePatient = vi.fn();
const mockUseMedicalRecords = vi.fn();
const mockUseDeleteMedicalRecord = vi.fn();
vi.mock('@/domain/patients/patients.hooks', () => ({
    usePatients: () => mockUsePatients(),
    usePatient: (id) => mockUsePatient(id),
}));
vi.mock('@/domain/medical-records/medical-records.hooks', () => ({
    useMedicalRecords: (patientId) => mockUseMedicalRecords(patientId),
    useDeleteMedicalRecord: () => mockUseDeleteMedicalRecord(),
    useMedicalRecordPrescriptions: () => ({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
    }),
}));
const createUser = (roles) => ({
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
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsx(MedicalRecordsListPage, {}) }) }));
}
describe('MedicalRecordsListPage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
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
            data: {
                id: 'patient-1',
                firstName: 'Lena',
                lastName: 'Morris',
                dateOfBirth: '1990-01-01',
                gender: 'FEMALE',
                phoneNumber: '+38344111111',
                address: 'Street 1',
                bloodType: 'A+',
            },
            isLoading: false,
            error: null,
        });
        mockUseMedicalRecords.mockReturnValue({
            data: [
                {
                    id: 'record-1',
                    patientId: 'patient-1',
                    doctorId: 'doctor-1',
                    diagnosis: 'Seasonal flu',
                    treatment: 'Rest and fluids',
                    prescriptionsText: 'Paracetamol as needed',
                    recordDate: '2026-05-01',
                    patient: {
                        id: 'patient-1',
                        firstName: 'Lena',
                        lastName: 'Morris',
                    },
                    doctor: {
                        id: 'doctor-1',
                        firstName: 'Ava',
                        lastName: 'Taylor',
                        specialization: 'General Medicine',
                    },
                    createdAt: '2026-05-01T10:00:00.000Z',
                    updatedAt: '2026-05-01T10:00:00.000Z',
                },
            ],
            isLoading: false,
            isFetching: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseDeleteMedicalRecord.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
            variables: null,
        });
    });
    it('hides write actions for non-doctor users', () => {
        renderPage('/app/medical-records?patientId=patient-1', ['NURSE']);
        expect(screen.getByText('Seasonal flu')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /create record/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    });
    it('shows write actions for doctors and admins', () => {
        renderPage('/app/medical-records?patientId=patient-1', ['DOCTOR']);
        expect(screen.getByRole('button', { name: /create record/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    });
});
