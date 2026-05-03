import { useQuery } from '@tanstack/react-query';
import { AuthAdminApi } from '@/domain/auth/auth.api';
export function useUsers(options = {}) {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => AuthAdminApi.listUsers(),
        enabled: options.enabled ?? true,
        staleTime: 1000 * 60 * 5,
        retry: (failCount, error) => {
            const status = typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof error.response === 'object' &&
                error.response !== null &&
                'status' in error.response
                ? error.response.status
                : undefined;
            if (status === 401 && failCount < 2)
                return true;
            return failCount < 3;
        },
    });
}
