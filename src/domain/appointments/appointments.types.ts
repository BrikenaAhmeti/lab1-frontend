export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export type AppointmentPatient = {
  id: string;
  firstName: string;
  lastName: string;
};

export type AppointmentDoctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string | null;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentListParams = {
  date?: string;
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus | '';
};

export type CreateAppointmentDTO = {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  notes?: string;
};

export type UpdateAppointmentDTO = {
  patientId?: string;
  doctorId?: string;
  date?: string;
  time?: string;
  status?: AppointmentStatus;
  notes?: string | null;
};
