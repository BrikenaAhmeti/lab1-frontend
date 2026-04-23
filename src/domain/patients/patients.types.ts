export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER';

export type PatientBloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Patient = {
  id: string;
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
};

export type PatientsListResponse = {
  items: Patient[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreatePatientDTO = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: PatientGender;
  phoneNumber: string;
  address: string;
  bloodType: PatientBloodType;
};

export type UpdatePatientDTO = Partial<CreatePatientDTO>;
