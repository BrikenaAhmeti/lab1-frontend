import { useQuery } from '@tanstack/react-query';
import { AuthAdminApi } from '@/domain/auth/auth.api';
import type { AuthUser } from '@/domain/auth/types';

type UseUsersOptions = {
  enabled?: boolean;
};

export function useUsers(options: UseUsersOptions = {}) {
  return useQuery({
    queryKey: ['users'],
    queryFn: (): Promise<AuthUser[]> => AuthAdminApi.listUsers(),
    enabled: options.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    retry: (failCount, error: unknown) => {
      const status =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'status' in error.response
          ? error.response.status
          : undefined;

      if (status === 401 && failCount < 2) return true;
      return failCount < 3;
    },
  });
}
