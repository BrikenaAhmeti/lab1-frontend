import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDeleteNurse, useNurse } from '@/domain/nurses/nurses.hooks';
import { formatNurseDate, getNurseApiMessage, getNurseApiStatus, getNurseFullName, getNurseShiftBadgeVariant, isKnownNurseShift, normalizeNurseShift, } from '@/domain/nurses/nurses.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import NurseStateCard from './state-card';
export default function NurseDetailsPage() {
    const { t, i18n } = useTranslation('nurses');
    const navigate = useNavigate();
    const location = useLocation();
    const { id = '' } = useParams();
    const nurseQuery = useNurse(id);
    const deleteNurse = useDeleteNurse();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const status = getNurseApiStatus(nurseQuery.error);
    const nurse = nurseQuery.data;
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);
    const getShiftLabel = (value) => {
        const normalized = normalizeNurseShift(value);
        if (isKnownNurseShift(normalized)) {
            return t(`shifts.${normalized}`);
        }
        return value || t('labels.notAvailable');
    };
    const handleDelete = async () => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteNurse.mutateAsync(id);
            navigate('/app/nurses', {
                replace: true,
                state: { success: t('messages.deleted') },
            });
        }
        catch (error) {
            setActionError(getNurseApiMessage(error, t('errors.delete')));
        }
    };
    if (nurseQuery.isLoading) {
        return (_jsx(NurseStateCard, { title: t('states.loadingNurseTitle'), description: t('states.loadingNurseDescription') }));
    }
    if (status === 401) {
        return (_jsx(NurseStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (status === 403) {
        return (_jsx(NurseStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (status === 404) {
        return (_jsx(NurseStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/nurses'), children: t('actions.back') }) }));
    }
    if (nurseQuery.error || !nurse) {
        return (_jsx(NurseStateCard, { title: t('states.errorTitle'), description: getNurseApiMessage(nurseQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => nurseQuery.refetch(), children: t('actions.retry') }) }));
    }
    const fields = [
        { label: t('fields.firstName'), value: nurse.firstName },
        { label: t('fields.lastName'), value: nurse.lastName },
        { label: t('fields.department'), value: nurse.department?.name || t('labels.noDepartment') },
        {
            label: t('fields.departmentLocation'),
            value: nurse.department?.location || t('labels.notAvailable'),
        },
        {
            label: t('fields.createdAt'),
            value: formatNurseDate(nurse.createdAt, i18n.language) || t('labels.notAvailable'),
        },
        {
            label: t('fields.updatedAt'),
            value: formatNurseDate(nurse.updatedAt, i18n.language) || t('labels.notAvailable'),
        },
    ];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: getNurseFullName(nurse) }), _jsx(Badge, { variant: getNurseShiftBadgeVariant(nurse.shift), children: getShiftLabel(nurse.shift) })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('details.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/app/nurses'), children: t('actions.back') }), nurse.departmentId ? (_jsx(Button, { variant: "ghost", onClick: () => navigate(`/app/departments/${nurse.departmentId}`), children: t('actions.viewDepartment') })) : null, _jsx(Button, { variant: "secondary", onClick: () => navigate(`/app/nurses/${nurse.id}/edit`), children: t('actions.edit') }), _jsx(Button, { variant: "danger", loading: deleteNurse.isPending, onClick: handleDelete, children: t('actions.delete') })] })] }), _jsx(Card, { title: t('details.title'), description: t('details.description'), children: _jsxs("div", { className: "space-y-4", children: [actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.shift') }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: getShiftLabel(nurse.shift) })] }), fields.map((field) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: field.label }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: field.value })] }, field.label)))] })] }) })] }));
}
