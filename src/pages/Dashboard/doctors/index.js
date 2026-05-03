import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDeleteDoctor, useDoctors } from '@/domain/doctors/doctors.hooks';
import { getDoctorApiMessage, getDoctorApiStatus, getDoctorFullName, } from '@/domain/doctors/doctors.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import DoctorStateCard from './state-card';
export default function DoctorsListPage() {
    const { t } = useTranslation('doctors');
    const navigate = useNavigate();
    const location = useLocation();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = isAdminUser(roles);
    const doctorsQuery = useDoctors();
    const deleteDoctor = useDeleteDoctor();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const status = getDoctorApiStatus(doctorsQuery.error);
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);
    const handleDelete = async (id) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteDoctor.mutateAsync(id);
            setActionSuccess(t('messages.deleted'));
        }
        catch (error) {
            setActionError(getDoctorApiMessage(error, t('errors.delete')));
        }
    };
    let content = null;
    if (doctorsQuery.isLoading) {
        content = (_jsx(DoctorStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (status === 401) {
        content = (_jsx(DoctorStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (status === 403) {
        content = (_jsx(DoctorStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (doctorsQuery.error) {
        content = (_jsx(DoctorStateCard, { title: t('states.errorTitle'), description: getDoctorApiMessage(doctorsQuery.error, t('errors.list')), children: _jsx(Button, { variant: "outline", onClick: () => doctorsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!doctorsQuery.data?.length) {
        content = (_jsx(DoctorStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription'), children: isAdmin ? (_jsx(Button, { onClick: () => navigate('/app/doctors/new'), children: t('actions.create') })) : null }));
    }
    else {
        content = (_jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: doctorsQuery.data.map((doctor) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: getDoctorFullName(doctor) }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: doctor.department?.name || t('labels.noDepartment') })] }), _jsx(Badge, { variant: "secondary", children: doctor.specialization })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.phoneNumber') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: doctor.phoneNumber })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.departmentLocation') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: doctor.department?.location || t('labels.notAvailable') })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/doctors/${doctor.id}`), children: t('actions.view') }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/doctors/${doctor.id}/edit`), children: t('actions.edit') }), isAdmin ? (_jsx(Button, { size: "sm", variant: "danger", loading: deleteDoctor.isPending && deleteDoctor.variables === doctor.id, onClick: () => handleDelete(doctor.id), children: t('actions.delete') })) : null] })] }, doctor.id))) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), isAdmin ? (_jsx(Button, { onClick: () => navigate('/app/doctors/new'), children: t('actions.create') })) : null] }), _jsx(Card, { title: t('list.resultsTitle'), description: doctorsQuery.data
                    ? t('list.results', { count: doctorsQuery.data.length })
                    : t('list.resultsDescription'), children: _jsxs("div", { className: "space-y-4", children: [doctorsQuery.isFetching && !doctorsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, content] }) })] }));
}
