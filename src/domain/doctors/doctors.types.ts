export type DoctorDepartment = {
  id: string;
  name: string;
  location: string;
};

export type Doctor = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentId: string;
  phoneNumber: string;
  isActive: boolean;
  department?: DoctorDepartment | null;
  createdAt?: string;
  updatedAt?: string;
};

type DoctorCreateBase = {
  firstName: string;
  lastName: string;
  specialization: string;
  departmentId: string;
  phoneNumber: string;
};

type DoctorExistingUserCreate = DoctorCreateBase & {
  userId: string;
  email?: never;
  username?: never;
  password?: never;
};

type DoctorNewLinkedUserCreate = DoctorCreateBase & {
  userId?: undefined;
  email?: string;
  username?: string;
  password?: string;
};

export type CreateDoctorDTO = DoctorExistingUserCreate | DoctorNewLinkedUserCreate;

export type UpdateDoctorDTO = Partial<DoctorCreateBase & { userId: string }>;
