export const nurseShiftValues = ['Morning', 'Evening', 'Night'] as const;

export type NurseShift = (typeof nurseShiftValues)[number];

export type NurseDepartment = {
  id: string;
  name: string;
  location: string;
};

export type NurseUser = {
  id?: string;
  email?: string | null;
  username?: string | null;
};

export type Nurse = {
  id: string;
  userId?: string | null;
  email?: string | null;
  username?: string | null;
  firstName: string;
  lastName: string;
  departmentId: string;
  shift: string;
  department?: NurseDepartment | null;
  user?: NurseUser | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NursesListParams = {
  departmentId?: string;
  search?: string;
  shift?: string;
};

type NurseCreateBase = {
  firstName: string;
  lastName: string;
  departmentId: string;
  shift: NurseShift;
};

export type CreateNurseDTO = NurseCreateBase & {
  userId?: undefined;
  email: string;
  username: string;
  password?: string;
};

export type UpdateNurseDTO = Partial<NurseCreateBase>;
