import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvoicesPage from '@/pages/Dashboard/invoices';
const mockUseInvoices = vi.fn();
const mockUseInvoiceStats = vi.fn();
const mockUseCreateInvoice = vi.fn();
const mockUsePayInvoice = vi.fn();
const mockUseCancelInvoice = vi.fn();
const mockUsePatients = vi.fn();
vi.mock('@/domain/invoices/invoices.hooks', () => ({
    useInvoices: (params) => mockUseInvoices(params),
    useInvoiceStats: () => mockUseInvoiceStats(),
    useCreateInvoice: () => mockUseCreateInvoice(),
    usePayInvoice: () => mockUsePayInvoice(),
    useCancelInvoice: () => mockUseCancelInvoice(),
}));
vi.mock('@/domain/patients/patients.hooks', () => ({
    usePatients: (params) => mockUsePatients(params),
}));
function createUser(roles) {
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
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsx(InvoicesPage, {}) }) }));
}
describe('InvoicesPage', () => {
    const createMutation = {
        mutateAsync: vi.fn().mockResolvedValue({ id: 'invoice-2' }),
        isPending: false,
    };
    const payMutation = {
        mutateAsync: vi.fn().mockResolvedValue(undefined),
        isPending: false,
        variables: undefined,
    };
    const cancelMutation = {
        mutateAsync: vi.fn().mockResolvedValue(undefined),
        isPending: false,
        variables: undefined,
    };
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.stubGlobal('confirm', vi.fn(() => true));
        mockUseInvoices.mockReturnValue({
            data: [
                {
                    id: 'invoice-1',
                    patientId: 'patient-1',
                    amount: 450,
                    invoiceDate: '2026-05-06',
                    status: 'PENDING',
                    description: 'Hospital stay',
                    patient: {
                        id: 'patient-1',
                        firstName: 'Lena',
                        lastName: 'Morris',
                    },
                },
            ],
            isLoading: false,
            isFetching: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseInvoiceStats.mockReturnValue({
            data: { totalRevenue: 1200 },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseCreateInvoice.mockReturnValue(createMutation);
        mockUsePayInvoice.mockReturnValue(payMutation);
        mockUseCancelInvoice.mockReturnValue(cancelMutation);
        mockUsePatients.mockReturnValue({
            data: {
                items: [
                    {
                        id: 'patient-1',
                        firstName: 'Lena',
                        lastName: 'Morris',
                        phoneNumber: '+38344111222',
                    },
                    {
                        id: 'patient-2',
                        firstName: 'Jon',
                        lastName: 'Cole',
                        phoneNumber: '+38344111333',
                    },
                ],
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });
    it('renders the revenue card, create form, and passes the status filter to the invoices query', () => {
        renderPage('/app/invoices?status=PAID', ['ADMIN']);
        expect(mockUseInvoices).toHaveBeenCalledWith({ status: 'PAID' });
        expect(screen.getByText('Total revenue')).toBeInTheDocument();
        expect(screen.getByText(/1,200|1200/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Create invoice' })).toBeInTheDocument();
        expect(screen.getByLabelText('Status')).toHaveValue('PAID');
        expect(screen.getAllByText('Pending')).not.toHaveLength(0);
    });
    it('submits the create invoice form with the expected payload', async () => {
        renderPage('/app/invoices', ['RECEPTIONIST']);
        fireEvent.change(screen.getByLabelText('Patient'), { target: { value: 'patient-2' } });
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '250.50' } });
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-05-07' } });
        fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Lab package' } });
        fireEvent.click(screen.getByRole('button', { name: /create invoice/i }));
        await waitFor(() => {
            expect(createMutation.mutateAsync).toHaveBeenCalledWith({
                patientId: 'patient-2',
                amount: 250.5,
                invoiceDate: '2026-05-07',
                description: 'Lab package',
            });
        });
    });
    it('marks a pending invoice as paid after confirmation', async () => {
        renderPage('/app/invoices', ['ADMIN']);
        fireEvent.click(screen.getByRole('button', { name: /mark as paid/i }));
        await waitFor(() => {
            expect(payMutation.mutateAsync).toHaveBeenCalledWith('invoice-1');
        });
    });
    it('hides management actions for view-only roles', () => {
        renderPage('/app/invoices', ['DOCTOR']);
        expect(screen.queryByText('Create invoice')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /mark as paid/i })).not.toBeInTheDocument();
        expect(screen.getByText('View only')).toBeInTheDocument();
    });
});
