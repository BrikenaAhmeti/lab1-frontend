import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RoomsApi } from './rooms.api';
import type {
  CreateRoomDTO,
  Room,
  RoomsListParams,
  UpdateRoomDTO,
} from './rooms.types';

export const roomsKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomsKeys.all, 'list'] as const,
  list: (params: RoomsListParams = {}) =>
    [
      ...roomsKeys.lists(),
      params.departmentId?.trim() ?? '',
      params.type?.trim() ?? '',
      params.onlyAvailable ? 'available' : 'all',
    ] as const,
  details: () => [...roomsKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomsKeys.details(), id] as const,
};

export function useRooms(params: RoomsListParams = {}) {
  return useQuery({
    queryKey: roomsKeys.list(params),
    queryFn: () => (params.onlyAvailable ? RoomsApi.available(params) : RoomsApi.list(params)),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: roomsKeys.detail(id),
    queryFn: () => RoomsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomDTO) => RoomsApi.create(payload),
    onSuccess: (room: Room) => {
      queryClient.setQueryData(roomsKeys.detail(room.id), room);
      queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomDTO }) =>
      RoomsApi.update(id, payload),
    onSuccess: (room: Room) => {
      queryClient.setQueryData(roomsKeys.detail(room.id), room);
      queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RoomsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: roomsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
    },
  });
}
