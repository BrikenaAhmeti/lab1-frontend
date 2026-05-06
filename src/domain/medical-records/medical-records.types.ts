export type MedicalRecordPatient = {
  id: string;
  firstName: string;
  lastName: string;
};

export type MedicalRecordDoctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
};

export type MedicalRecord = {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  prescriptionsText: string | null;
  recordDate: string;
  patient: MedicalRecordPatient;
  doctor: MedicalRecordDoctor;
  createdAt: string;
  updatedAt: string;
};

export type Prescription = {
  id: string;
  medicalRecordId: string;
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MedicalRecordsListParams = {
  patientId?: string;
};

export type CreateMedicalRecordDTO = {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  prescriptionsText?: string | null;
  date: string;
};

export type UpdateMedicalRecordDTO = Partial<CreateMedicalRecordDTO>;

export type CreatePrescriptionDTO = {
  medicalRecordId: string;
  medicine: string;
  dosage: string;
  duration: string;
  instructions?: string | null;
};

export type UpdatePrescriptionDTO = Partial<Omit<CreatePrescriptionDTO, 'medicalRecordId'>>;
