import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/libs/axios/client';
import { InvoicesApi } from './invoices.api';

describe('InvoicesApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends invoice status and date filters to the backend', async () => {
    const getMock = vi.spyOn(api.core, 'get').mockResolvedValue({
      data: [],
    });

    await InvoicesApi.list({
      patientId: ' patient-1 ',
      status: 'PAID',
      date: ' 2099-10-10 ',
      from: ' 2099-10-01 ',
      to: ' 2099-10-31 ',
    });

    expect(getMock).toHaveBeenCalledWith(
      '/api/invoices?patientId=patient-1&status=PAID&date=2099-10-10&from=2099-10-01&to=2099-10-31'
    );
  });
});
