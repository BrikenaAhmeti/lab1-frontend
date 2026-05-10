import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../contexts/ToastContext';
import { moduleConfigs } from '../modules';
import ModulePage from './ModulePage';
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        can: () => true,
    }),
}));
function renderPage() {
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
    render(_jsx(LanguageProvider, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(ToastProvider, { children: _jsx(MemoryRouter, { initialEntries: ['/patients'], children: _jsx(ModulePage, { moduleKey: "patients" }) }) }) }) }));
}
async function fillPatientForm() {
    fireEvent.change(document.getElementById('first_name'), {
        target: { value: 'John' },
    });
    fireEvent.change(document.getElementById('last_name'), {
        target: { value: 'Doe' },
    });
    fireEvent.change(document.getElementById('date_of_birth'), {
        target: { value: '1990-05-12' },
    });
    fireEvent.click(screen.getByTestId('select-gender'));
    fireEvent.click(screen.getByRole('option', { name: /^Male$/i }));
    fireEvent.change(document.getElementById('phone'), {
        target: { value: '+38344111222' },
    });
    fireEvent.click(screen.getByTestId('select-blood_group'));
    fireEvent.click(screen.getByRole('option', { name: /^O\+$/ }));
    fireEvent.change(document.getElementById('address'), {
        target: { value: 'Prishtina' },
    });
}
describe('ModulePage', () => {
    const patientListResponse = {
        data: [
            {
                id: 'patient-1',
                first_name: 'Jane',
                last_name: 'Doe',
                date_of_birth: '1991-03-12',
                gender: 'FEMALE',
                phone: '+38344111111',
                blood_group: 'A+',
                address: 'Main Street',
            },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
    };
    const originalService = moduleConfigs.patients.service;
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
        expect(screen.getByText('We could not reach the server. Check your connection and try again.')).toBeInTheDocument();
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
            expect(moduleConfigs.patients.service.create).toHaveBeenCalledWith(expect.objectContaining({
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1990-05-12',
                gender: 'MALE',
                phone: '+38344111222',
                blood_group: 'O+',
                address: 'Prishtina',
            }));
        });
        expect(await screen.findByText('Created successfully.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
        await waitFor(() => {
            expect(document.getElementById('first_name')).toHaveValue('Jane');
        });
        fireEvent.change(document.getElementById('phone'), {
            target: { value: '+38344999999' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        await waitFor(() => {
            expect(moduleConfigs.patients.service.update).toHaveBeenCalledWith('patient-1', expect.objectContaining({
                phone: '+38344999999',
            }));
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
        expect(await screen.findByText('We could not reach the server. Check your connection and try again.')).toBeInTheDocument();
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
