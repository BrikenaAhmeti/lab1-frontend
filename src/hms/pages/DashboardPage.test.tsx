import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import { fetchArrayWithFallback } from '../lib/api';
import DashboardPage from './DashboardPage';

vi.mock('../lib/api', () => ({
  fetchArrayWithFallback: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </LanguageProvider>
  );
}

describe('DashboardPage', () => {
  const mockFetchArrayWithFallback = vi.mocked(fetchArrayWithFallback);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a retry action with a friendly message when a dashboard list fails', async () => {
    mockFetchArrayWithFallback.mockImplementation((paths: string[]) => {
      const firstPath = paths[0] || '';

      if (firstPath.includes('appointments')) {
        return Promise.reject({ message: 'Network Error', code: 'ERR_NETWORK' });
      }

      return Promise.resolve([]);
    });

    renderPage();

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('We could not reach the server. Check your connection and try again.')
    ).toBeInTheDocument();

    mockFetchArrayWithFallback.mockImplementation((paths: string[]) => {
      const firstPath = paths[0] || '';

      if (firstPath.includes('appointments')) {
        return Promise.resolve([
          {
            id: 'appointment-1',
            patient: {
              first_name: 'Lena',
              last_name: 'Stone',
            },
            doctor: {
              first_name: 'Ava',
              last_name: 'Cole',
            },
            date: '2099-10-10',
            time: '09:30',
          },
        ]);
      }

      return Promise.resolve([]);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Lena Stone')).toBeInTheDocument();
  });
});
