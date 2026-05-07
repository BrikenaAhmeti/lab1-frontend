export const roomTypeValues = ['GENERAL', 'ICU', 'SURGERY', 'EMERGENCY', 'PEDIATRIC'] as const;
export const roomStatusValues = ['AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE'] as const;

export type RoomType = (typeof roomTypeValues)[number];
export type RoomStatus = (typeof roomStatusValues)[number];

export type RoomDepartment = {
  id: string;
  name: string;
  location: string;
};

export type Room = {
  id: string;
  roomNumber: string;
  departmentId: string;
  type: string;
  status: string;
  capacity: number;
  activeAdmissionsCount: number;
  availableCapacity: number;
  department?: RoomDepartment | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RoomsListParams = {
  departmentId?: string;
  type?: string;
  onlyAvailable?: boolean;
};

export type CreateRoomDTO = {
  roomNumber: string;
  departmentId: string;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
};

export type UpdateRoomDTO = Partial<CreateRoomDTO>;
