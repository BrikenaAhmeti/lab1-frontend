import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import InvoicesPage from '@/pages/Dashboard/invoices';

const mockUseInvoices = vi.fn();
const mockUseInvoiceStats = vi.fn();
const mockUseCreateInvoice = vi.fn();
const mockUsePayInvoice = vi.fn();
const mockUseCancelInvoice = vi.fn();
const mockUsePatients = vi.fn();

vi.mock('@/domain/invoices/invoices.hooks', () => ({
  useInvoices: (params?: {
    patientId?: string;
    status?: string;
    date?: string;
    from?: string;
    to?: string;
  }) => mockUseInvoices(params),
  useInvoiceStats: () => mockUseInvoiceStats(),
  useCreateInvoice: () => mockUseCreateInvoice(),
  usePayInvoice: () => mockUsePayInvoice(),
  useCancelInvoice: () => mockUseCancelInvoice(),
}));

vi.mock('@/domain/patients/patients.hooks', () => ({
  usePatients: (params?: { page?: number; limit?: number; search?: string }) => mockUsePatients(params),
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
      <LanguageProvider>
        <MemoryRouter initialEntries={[route]}>
          <InvoicesPage />
        </MemoryRouter>
      </LanguageProvider>
    </Provider>
  );
}

function chooseSelectOption(label: string, optionName: RegExp) {
  fireEvent.click(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: optionName }));
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

  it('renders the revenue card, create form, and passes status/date filters to the invoices query', () => {
    renderPage('/app/invoices?status=PAID&from=2099-10-01&to=2099-10-31', ['ADMIN']);

    expect(mockUseInvoices).toHaveBeenCalledWith({
      status: 'PAID',
      from: '2099-10-01',
      to: '2099-10-31',
    });
    expect(screen.getByText('Total revenue')).toBeInTheDocument();
    expect(screen.getByText(/1,200|1200/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create invoice' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Paid');
    expect(screen.getByDisplayValue('2099-10-01 - 2099-10-31')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')).not.toHaveLength(0);
  });

  it('passes an exact invoice date filter to the invoices query', () => {
    renderPage('/app/invoices?date=2099-10-10', ['RECEPTIONIST']);

    expect(mockUseInvoices).toHaveBeenCalledWith({ date: '2099-10-10' });
    expect(screen.getByDisplayValue('2099-10-10')).toBeInTheDocument();
  });

  it('submits the create invoice form with the expected payload', async () => {
    renderPage('/app/invoices', ['RECEPTIONIST']);

    chooseSelectOption('Patient', /Jon Cole/);
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '250.50' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-05-07' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Lab package' } });
    fireEvent.click(screen.getByRole('button', { name: /create invoice/i }));

    await waitFor(() => {
      expect(createMutation.mutateAsync).toHaveBeenCalledWith({
        patientId: 'patient-2',
        appointmentId: null,
        admissionId: null,
        amount: 250.5,
        invoiceDate: '2026-05-07',
        description: 'Lab package',
      });
    });
  });

  it('marks a pending invoice as paid after confirmation', async () => {
    renderPage('/app/invoices', ['ADMIN']);

    fireEvent.click(screen.getByRole('button', { name: /mark as paid/i }));

    expect(window.confirm).not.toHaveBeenCalled();
    expect(payMutation.mutateAsync).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: /confirm payment/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Lena Morris')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mark invoice paid/i }));

    await waitFor(() => {
      expect(payMutation.mutateAsync).toHaveBeenCalledWith('invoice-1');
    });
  });

  it('hides management actions for view-only roles', () => {
    renderPage('/app/invoices', ['DOCTOR']);

    expect(screen.queryByText('Create invoice')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark as paid/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });
});
