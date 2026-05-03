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
  department?: DoctorDepartment | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateDoctorDTO = {
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentId: string;
  phoneNumber: string;
};

export type UpdateDoctorDTO = Partial<CreateDoctorDTO>;
