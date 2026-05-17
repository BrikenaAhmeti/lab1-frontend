export const nurseShiftValues = ['Morning', 'Evening', 'Night'] as const;

export type NurseShift = (typeof nurseShiftValues)[number];

export type NurseDepartment = {
  id: string;
  name: string;
  location: string;
};

export type Nurse = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  shift: string;
  department?: NurseDepartment | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NursesListParams = {
  departmentId?: string;
};

type NurseCreateBase = {
  firstName: string;
  lastName: string;
  departmentId: string;
  shift: NurseShift;
};

type NurseExistingUserCreate = NurseCreateBase & {
  userId: string;
  email?: never;
  username?: never;
  password?: never;
};

type NurseNewLinkedUserCreate = NurseCreateBase & {
  userId?: undefined;
  email: string;
  username?: string;
  password?: string;
};

export type CreateNurseDTO = NurseExistingUserCreate | NurseNewLinkedUserCreate;

export type UpdateNurseDTO = Partial<NurseCreateBase>;
