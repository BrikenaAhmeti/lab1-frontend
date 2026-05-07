import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/ui/layouts/AppLayout';
import { GuestOnly, RequireAuth } from '@/domain/auth/guards';
import Login from '@/pages/Auth/login';
import Register from '@/pages/Auth/register';
import NotFound from '@/pages/NotFound';
import DesignSystemPage from '@/pages/DesignSystem';
import ModulePage from '@/pages/Dashboard/modules';
import DashboardHomePage from '@/pages/Dashboard/home';
import TransactionsPageRTK from '@/pages/Dashboard/transactions';
import TransactionsPageRQ from '@/pages/Dashboard/transactions/tan-transactions';
import PatientsListPage from '@/pages/Dashboard/patients';
import PatientDetailsPage from '@/pages/Dashboard/patients/details';
import PatientFormPage from '@/pages/Dashboard/patients/form';
import AppointmentsListPage from '@/pages/Dashboard/appointments';
import AppointmentDetailsPage from '@/pages/Dashboard/appointments/details';
import AppointmentFormPage from '@/pages/Dashboard/appointments/form';
import DoctorsListPage from '@/pages/Dashboard/doctors';
import DoctorDetailsPage from '@/pages/Dashboard/doctors/details';
import DoctorFormPage from '@/pages/Dashboard/doctors/form';
import DepartmentsListPage from '@/pages/Dashboard/departments';
import DepartmentDetailsPage from '@/pages/Dashboard/departments/details';
import DepartmentFormPage from '@/pages/Dashboard/departments/form';
import RoomsListPage from '@/pages/Dashboard/rooms';
import RoomDetailsPage from '@/pages/Dashboard/rooms/details';
import RoomFormPage from '@/pages/Dashboard/rooms/form';
import AdmissionsPage from '@/pages/Dashboard/admissions';
import InvoicesPage from '@/pages/Dashboard/invoices';
import NursesListPage from '@/pages/Dashboard/nurses';
import NurseDetailsPage from '@/pages/Dashboard/nurses/details';
import NurseFormPage from '@/pages/Dashboard/nurses/form';
import MedicalRecordsListPage from '@/pages/Dashboard/medical-records';
import MedicalRecordFormPage from '@/pages/Dashboard/medical-records/form';
import { moduleNavigation } from '@/config/moduleNavigation';
const moduleRoutes = moduleNavigation
    .filter((item) => !['patients', 'doctors', 'departments', 'appointments', 'medicalRecords', 'rooms', 'admissions', 'invoices', 'nurses'].includes(item.key))
    .map((item) => ({
    path: item.path,
    element: _jsx(ModulePage, { moduleKey: item.key }),
}));
export const router = createBrowserRouter([
    {
        element: _jsx(GuestOnly, {}),
        children: [
            {
                element: _jsx(Login, {}),
                path: '/login',
            },
            {
                element: _jsx(Register, {}),
                path: '/register',
            },
        ],
    },
    {
        path: '/transactions',
        element: _jsx(Navigate, { to: "/app/tan-transactions", replace: true }),
    },
    {
        element: _jsx(DesignSystemPage, {}),
        path: '/design-system',
    },
    {
        path: '/app',
        element: _jsx(RequireAuth, {}),
        children: [
            {
                element: _jsx(AppLayout, {}),
                children: [
                    { index: true, element: _jsx(DashboardHomePage, {}) },
                    {
                        path: 'patients',
                        children: [
                            { index: true, element: _jsx(PatientsListPage, {}) },
                            { path: 'new', element: _jsx(PatientFormPage, {}) },
                            { path: ':id', element: _jsx(PatientDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(PatientFormPage, {}) },
                        ],
                    },
                    {
                        path: 'appointments',
                        children: [
                            { index: true, element: _jsx(AppointmentsListPage, {}) },
                            { path: 'new', element: _jsx(AppointmentFormPage, {}) },
                            { path: ':id', element: _jsx(AppointmentDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(AppointmentFormPage, {}) },
                        ],
                    },
                    {
                        path: 'doctors',
                        children: [
                            { index: true, element: _jsx(DoctorsListPage, {}) },
                            { path: 'new', element: _jsx(DoctorFormPage, {}) },
                            { path: ':id', element: _jsx(DoctorDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(DoctorFormPage, {}) },
                        ],
                    },
                    {
                        path: 'departments',
                        children: [
                            { index: true, element: _jsx(DepartmentsListPage, {}) },
                            { path: 'new', element: _jsx(DepartmentFormPage, {}) },
                            { path: ':id', element: _jsx(DepartmentDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(DepartmentFormPage, {}) },
                        ],
                    },
                    {
                        path: 'rooms',
                        children: [
                            { index: true, element: _jsx(RoomsListPage, {}) },
                            { path: 'new', element: _jsx(RoomFormPage, {}) },
                            { path: ':id', element: _jsx(RoomDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(RoomFormPage, {}) },
                        ],
                    },
                    {
                        path: 'admissions',
                        element: _jsx(AdmissionsPage, {}),
                    },
                    {
                        path: 'invoices',
                        element: _jsx(InvoicesPage, {}),
                    },
                    {
                        path: 'nurses',
                        children: [
                            { index: true, element: _jsx(NursesListPage, {}) },
                            { path: 'new', element: _jsx(NurseFormPage, {}) },
                            { path: ':id', element: _jsx(NurseDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(NurseFormPage, {}) },
                        ],
                    },
                    {
                        path: 'medical-records',
                        children: [
                            { index: true, element: _jsx(MedicalRecordsListPage, {}) },
                            { path: 'new', element: _jsx(MedicalRecordFormPage, {}) },
                            { path: ':id/edit', element: _jsx(MedicalRecordFormPage, {}) },
                        ],
                    },
                    ...moduleRoutes,
                    { path: 'transactions', element: _jsx(TransactionsPageRTK, {}) },
                    { path: 'tan-transactions', element: _jsx(TransactionsPageRQ, {}) },
                    { path: 'admin', element: _jsx(Navigate, { to: "/app/patients", replace: true }) },
                ],
            },
        ],
    },
    {
        path: '/403',
        element: _jsx("div", { className: "p-6", children: "Forbidden" }),
    },
    {
        path: '*',
        element: _jsx(NotFound, {}),
    },
    {
        path: '/dashboard',
        element: _jsx(Navigate, { to: "/app", replace: true }),
    },
]);
