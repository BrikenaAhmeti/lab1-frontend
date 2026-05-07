export const admissionStatusValues = ['ACTIVE', 'DISCHARGED'] as const;

export type AdmissionStatus = (typeof admissionStatusValues)[number];

export type AdmissionPatient = {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
};

export type AdmissionRoomDepartment = {
  id: string;
  name: string;
  location?: string;
};

export type AdmissionRoom = {
  id: string;
  roomNumber?: string;
  departmentId?: string;
  type?: string;
  status?: string;
  capacity?: number;
  activeAdmissionsCount?: number;
  availableCapacity?: number;
  department?: AdmissionRoomDepartment | null;
};

export type Admission = {
  id: string;
  patientId: string;
  roomId: string;
  status: string;
  admissionDate?: string;
  admittedAt?: string;
  dischargeDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  patient?: AdmissionPatient | null;
  room?: AdmissionRoom | null;
  [key: string]: unknown;
};

export type AdmissionsListParams = {
  status?: string;
};

export type CreateAdmissionDTO = {
  patientId: string;
  roomId: string;
  admissionDate?: string;
};
