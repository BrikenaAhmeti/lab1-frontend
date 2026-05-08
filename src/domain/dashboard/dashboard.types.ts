import type { Admission } from '@/domain/admissions/admissions.types';
import type { Appointment } from '@/domain/appointments/appointments.types';

export type DashboardStats = {
  appointmentsToday: number;
  availableRooms: number;
  admittedPatients: number;
  totalPatients: number;
  totalDoctors: number;
  pendingInvoicesAmount: number;
};

export type DashboardTodayAppointment = Appointment;

export type DashboardActiveAdmission = Admission;
