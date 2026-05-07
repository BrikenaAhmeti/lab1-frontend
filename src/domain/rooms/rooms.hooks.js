import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RoomsApi } from './rooms.api';
export const roomsKeys = {
    all: ['rooms'],
    lists: () => [...roomsKeys.all, 'list'],
    list: (params = {}) => [
        ...roomsKeys.lists(),
        params.departmentId?.trim() ?? '',
        params.type?.trim() ?? '',
        params.onlyAvailable ? 'available' : 'all',
    ],
    details: () => [...roomsKeys.all, 'detail'],
    detail: (id) => [...roomsKeys.details(), id],
};
export function useRooms(params = {}) {
    return useQuery({
        queryKey: roomsKeys.list(params),
        queryFn: () => (params.onlyAvailable ? RoomsApi.available(params) : RoomsApi.list(params)),
    });
}
export function useRoom(id) {
    return useQuery({
        queryKey: roomsKeys.detail(id),
        queryFn: () => RoomsApi.get(id),
        enabled: !!id,
    });
}
export function useCreateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => RoomsApi.create(payload),
        onSuccess: (room) => {
            queryClient.setQueryData(roomsKeys.detail(room.id), room);
            queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
        },
    });
}
export function useUpdateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => RoomsApi.update(id, payload),
        onSuccess: (room) => {
            queryClient.setQueryData(roomsKeys.detail(room.id), room);
            queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
        },
    });
}
export function useDeleteRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => RoomsApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: roomsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
        },
    });
}
