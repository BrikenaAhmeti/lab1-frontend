import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, createCrudService } from './api';

describe('createCrudService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves camelCase query params for list requests', async () => {
    const getMock = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    });

    const service = createCrudService('/api/test');

    await service.list({ firstName: 'Ana', userId: 'user-1' });

    expect(getMock).toHaveBeenCalledWith('/api/test?firstName=Ana&userId=user-1');
  });

  it('maps createdAt sorting to created_at for list requests', async () => {
    const getMock = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    });

    const service = createCrudService('/api/test');

    await service.list({ sortBy: 'createdAt', order: 'DESC' });

    expect(getMock).toHaveBeenCalledWith('/api/test?sortBy=created_at&order=DESC');
  });

  it('preserves camelCase payload keys for create and update requests', async () => {
    const postMock = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
    const putMock = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: {} });

    const service = createCrudService('/api/test');
    const payload = { firstName: 'Ana', userId: 'user-1', departmentId: 'dep-1' };

    await service.create(payload);
    await service.update('123', payload);

    expect(postMock).toHaveBeenCalledWith('/api/test', payload);
    expect(putMock).toHaveBeenCalledWith('/api/test/123', payload);
  });
});
