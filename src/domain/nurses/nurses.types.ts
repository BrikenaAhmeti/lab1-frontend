export const nurseShiftValues = ['Morning', 'Evening', 'Night'] as const;

export type NurseShift = (typeof nurseShiftValues)[number];

export type NurseDepartment = {
  id: string;
  name: string;
  location: string;
};

export type Nurse = {
  id: string;
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

export type CreateNurseDTO = {
  firstName: string;
  lastName: string;
  departmentId: string;
  shift: NurseShift;
};

export type UpdateNurseDTO = Partial<CreateNurseDTO>;
