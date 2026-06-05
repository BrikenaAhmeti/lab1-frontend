import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/libs/axios/client';
import { PatientsApi } from './patients.api';

describe('PatientsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes gender filters and mixed-case response values', async () => {
    const getMock = vi.spyOn(api.core, 'get').mockResolvedValue({
      data: {
        data: [
          {
            id: 'patient-1',
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1991-03-12T00:00:00.000Z',
            gender: 'female',
            phoneNumber: '+38344111111',
            bloodType: 'a+',
            address: 'Main Street',
          },
        ],
        total: 1,
        page: 2,
        limit: 20,
        totalPages: 3,
      },
    });

    const result = await PatientsApi.list({
      page: 2,
      limit: 20,
      search: ' Jane ',
      gender: 'female' as any,
    });

    expect(getMock).toHaveBeenCalledWith('/api/patients?page=2&limit=20&search=Jane&gender=FEMALE');
    expect(result.items[0]).toMatchObject({
      gender: 'FEMALE',
      bloodType: 'A+',
      dateOfBirth: '1991-03-12',
    });
  });

  it('normalizes create payload gender before sending it to the backend', async () => {
    const postMock = vi.spyOn(api.core, 'post').mockResolvedValue({
      data: {
        id: 'patient-2',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-12',
        gender: 'male',
        phoneNumber: '+38344111222',
        bloodType: 'O+',
        address: 'Prishtina',
      },
    });

    const result = await PatientsApi.create({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-05-12',
      gender: 'male' as any,
      phoneNumber: '+38344111222',
      bloodType: 'O+',
      address: 'Prishtina',
    });

    expect(postMock).toHaveBeenCalledWith(
      '/api/patients',
      expect.objectContaining({ gender: 'MALE' })
    );
    expect(result.gender).toBe('MALE');
  });
});
