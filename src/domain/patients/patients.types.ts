export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER';

export type PatientBloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Patient = {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: PatientGender;
  phoneNumber: string;
  address: string;
  bloodType: PatientBloodType;
};

export type PatientsListParams = {
  page?: number;
  limit?: number;
  search?: string;
  gender?: PatientGender;
};

export type PatientsListResponse = {
  items: Patient[];
  data: Patient[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreatePatientDTO = {
  userId?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: PatientGender;
  phoneNumber: string;
  address: string;
  bloodType: PatientBloodType;
};

export type UpdatePatientDTO = Partial<CreatePatientDTO>;
