import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDeleteDoctor, useDoctor } from '@/domain/doctors/doctors.hooks';
import { formatDoctorDate, getDoctorApiMessage, getDoctorApiStatus, getDoctorFullName, } from '@/domain/doctors/doctors.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import RelatedAppointmentsCard from '@/pages/Dashboard/appointments/related-card';
import DoctorStateCard from './state-card';
export default function DoctorDetailsPage() {
    const { t, i18n } = useTranslation('doctors');
    const navigate = useNavigate();
    const location = useLocation();
    const { id = '' } = useParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = isAdminUser(roles);
    const doctorQuery = useDoctor(id);
    const deleteDoctor = useDeleteDoctor();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const status = getDoctorApiStatus(doctorQuery.error);
    const doctor = doctorQuery.data;
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);
    const handleDelete = async () => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteDoctor.mutateAsync(id);
            navigate('/app/doctors', {
                replace: true,
                state: { success: t('messages.deleted') },
            });
        }
        catch (error) {
            setActionError(getDoctorApiMessage(error, t('errors.delete')));
        }
    };
    if (doctorQuery.isLoading) {
        return (_jsx(DoctorStateCard, { title: t('states.loadingDoctorTitle'), description: t('states.loadingDoctorDescription') }));
    }
    if (status === 401) {
        return (_jsx(DoctorStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (status === 403) {
        return (_jsx(DoctorStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (status === 404) {
        return (_jsx(DoctorStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.back') }) }));
    }
    if (doctorQuery.error || !doctor) {
        return (_jsx(DoctorStateCard, { title: t('states.errorTitle'), description: getDoctorApiMessage(doctorQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => doctorQuery.refetch(), children: t('actions.retry') }) }));
    }
    const fields = [
        { label: t('fields.userId'), value: doctor.userId },
        { label: t('fields.phoneNumber'), value: doctor.phoneNumber },
        { label: t('fields.department'), value: doctor.department?.name || t('labels.noDepartment') },
        {
            label: t('fields.departmentLocation'),
            value: doctor.department?.location || t('labels.notAvailable'),
        },
        {
            label: t('fields.createdAt'),
            value: formatDoctorDate(doctor.createdAt, i18n.language) || t('labels.notAvailable'),
        },
        {
            label: t('fields.updatedAt'),
            value: formatDoctorDate(doctor.updatedAt, i18n.language) || t('labels.notAvailable'),
        },
    ];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: getDoctorFullName(doctor) }), _jsx(Badge, { variant: "secondary", children: doctor.specialization })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('details.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.back') }), doctor.departmentId ? (_jsx(Button, { variant: "ghost", onClick: () => navigate(`/app/departments/${doctor.departmentId}`), children: t('actions.viewDepartment') })) : null, _jsx(Button, { variant: "secondary", onClick: () => navigate(`/app/doctors/${doctor.id}/edit`), children: t('actions.edit') }), isAdmin ? (_jsx(Button, { variant: "danger", loading: deleteDoctor.isPending, onClick: handleDelete, children: t('actions.delete') })) : null] })] }), _jsx(Card, { title: t('details.title'), description: t('details.description'), children: _jsxs("div", { className: "space-y-4", children: [actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.specialization') }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: doctor.specialization })] }), fields.map((field) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: field.label }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: field.value })] }, field.label)))] })] }) }), _jsx(RelatedAppointmentsCard, { doctorId: doctor.id })] }));
}
