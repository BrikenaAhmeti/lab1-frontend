import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/libs/axios/client';
import { AdmissionsApi } from './admissions.api';

describe('AdmissionsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends documented admission filters to the backend', async () => {
    const getMock = vi.spyOn(api.core, 'get').mockResolvedValue({
      data: [],
    });

    await AdmissionsApi.list({
      status: ' ACTIVE ',
      patientId: ' patient-1 ',
      roomId: ' room-1 ',
    });

    expect(getMock).toHaveBeenCalledWith(
      '/api/admissions?status=ACTIVE&patientId=patient-1&roomId=room-1'
    );
  });
});
