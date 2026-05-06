import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatePrescription, useDeletePrescription, useMedicalRecordPrescriptions, useUpdatePrescription, } from '@/domain/medical-records/medical-records.hooks';
import { getMedicalRecordApiMessage } from '@/domain/medical-records/medical-records.utils';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Textarea from '@/ui/atoms/Textarea';
const emptyForm = {
    medicine: '',
    dosage: '',
    duration: '',
    instructions: '',
};
function getFormValues(prescription) {
    if (!prescription) {
        return emptyForm;
    }
    return {
        medicine: prescription.medicine,
        dosage: prescription.dosage,
        duration: prescription.duration,
        instructions: prescription.instructions ?? '',
    };
}
function validateForm(values, t) {
    const errors = {};
    if (!values.medicine.trim()) {
        errors.medicine = t('validation.required');
    }
    if (!values.dosage.trim()) {
        errors.dosage = t('validation.required');
    }
    if (!values.duration.trim()) {
        errors.duration = t('validation.required');
    }
    return errors;
}
export default function PrescriptionPanel({ medicalRecordId, canManage = false, }) {
    const { t } = useTranslation('medicalRecords');
    const prescriptionsQuery = useMedicalRecordPrescriptions(medicalRecordId);
    const createPrescription = useCreatePrescription();
    const updatePrescription = useUpdatePrescription();
    const deletePrescription = useDeletePrescription();
    const prescriptions = prescriptionsQuery.data ?? [];
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [editingId, setEditingId] = useState('');
    const [showForm, setShowForm] = useState(false);
    const saving = createPrescription.isPending || updatePrescription.isPending;
    const resetForm = () => {
        setForm(emptyForm);
        setErrors({});
        setFormError('');
        setEditingId('');
        setShowForm(false);
    };
    const handleChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
        setFormSuccess('');
    };
    const handleCreateClick = () => {
        setForm(emptyForm);
        setErrors({});
        setFormError('');
        setFormSuccess('');
        setEditingId('');
        setShowForm(true);
    };
    const handleEditClick = (prescription) => {
        setForm(getFormValues(prescription));
        setErrors({});
        setFormError('');
        setFormSuccess('');
        setEditingId(prescription.id);
        setShowForm(true);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        const payload = {
            medicine: form.medicine.trim(),
            dosage: form.dosage.trim(),
            duration: form.duration.trim(),
            instructions: form.instructions.trim() || null,
        };
        try {
            setFormError('');
            setFormSuccess('');
            if (editingId) {
                await updatePrescription.mutateAsync({
                    id: editingId,
                    payload,
                });
            }
            else {
                await createPrescription.mutateAsync({
                    medicalRecordId,
                    ...payload,
                });
            }
            resetForm();
            setFormSuccess(editingId ? t('messages.prescriptionUpdated') : t('messages.prescriptionCreated'));
        }
        catch (error) {
            setFormError(getMedicalRecordApiMessage(error, t('errors.prescriptionSave'), {
                400: t('errors.invalidPrescriptionData'),
                403: t('errors.writeForbidden'),
                404: t('errors.notFound'),
            }));
        }
    };
    const handleDelete = async (prescription) => {
        if (!window.confirm(t('prescriptions.deleteConfirm'))) {
            return;
        }
        try {
            setFormError('');
            setFormSuccess('');
            await deletePrescription.mutateAsync({
                id: prescription.id,
                medicalRecordId: prescription.medicalRecordId,
            });
            if (editingId === prescription.id) {
                resetForm();
            }
            setFormSuccess(t('messages.prescriptionDeleted'));
        }
        catch (error) {
            setFormError(getMedicalRecordApiMessage(error, t('errors.prescriptionDelete'), {
                403: t('errors.writeForbidden'),
                404: t('errors.notFound'),
            }));
        }
    };
    return (_jsxs("div", { className: "mt-4 rounded-2xl border border-border/70 bg-background/60 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-foreground", children: t('prescriptions.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('prescriptions.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2 print:hidden", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => window.print(), children: t('actions.print') }), canManage ? (_jsx(Button, { size: "sm", variant: "secondary", onClick: handleCreateClick, children: t('actions.addPrescription') })) : null] })] }), formSuccess ? (_jsx("div", { className: "mt-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: formSuccess })) : null, formError ? (_jsx("div", { className: "mt-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, showForm && canManage ? (_jsxs("form", { className: "mt-4 space-y-4 rounded-2xl border border-border/70 bg-background/70 p-4 print:hidden", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-foreground", children: editingId ? t('prescriptions.editTitle') : t('prescriptions.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('prescriptions.formDescription') })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { required: true, name: "medicine", label: t('fields.medicine'), value: form.medicine, error: errors.medicine, onChange: (event) => handleChange('medicine', event.target.value) }), _jsx(Input, { required: true, name: "dosage", label: t('fields.dosage'), value: form.dosage, error: errors.dosage, onChange: (event) => handleChange('dosage', event.target.value) }), _jsx(Input, { required: true, name: "duration", label: t('fields.duration'), value: form.duration, error: errors.duration, onChange: (event) => handleChange('duration', event.target.value) })] }), _jsx(Textarea, { name: "instructions", label: t('fields.instructions'), value: form.instructions, placeholder: t('prescriptions.instructionsPlaceholder'), onChange: (event) => handleChange('instructions', event.target.value) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "submit", loading: saving, children: editingId ? t('actions.updatePrescription') : t('actions.savePrescription') }), _jsx(Button, { type: "button", variant: "outline", onClick: resetForm, children: t('actions.cancel') })] })] })) : null, prescriptionsQuery.isLoading ? (_jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: t('prescriptions.loading') })) : prescriptionsQuery.error ? (_jsxs("div", { className: "mt-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getMedicalRecordApiMessage(prescriptionsQuery.error, t('errors.prescriptions')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3 print:hidden", onClick: () => prescriptionsQuery.refetch(), children: t('actions.retry') })] })) : !prescriptions.length ? (_jsxs("div", { className: "mt-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('prescriptions.emptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('prescriptions.empty') }), canManage ? (_jsx(Button, { size: "sm", className: "mt-4 print:hidden", onClick: handleCreateClick, children: t('actions.addPrescription') })) : null] })) : (_jsx("div", { className: "mt-4 space-y-3", children: prescriptions.map((prescription) => {
                    const deleting = deletePrescription.isPending && deletePrescription.variables?.id === prescription.id;
                    return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/70 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: prescription.medicine }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [prescription.dosage, " \u00B7 ", prescription.duration] })] }), canManage ? (_jsxs("div", { className: "flex flex-wrap gap-2 print:hidden", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleEditClick(prescription), children: t('actions.edit') }), _jsx(Button, { size: "sm", variant: "danger", loading: deleting, onClick: () => handleDelete(prescription), children: t('actions.delete') })] })) : null] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.medicine') }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: prescription.medicine })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.dosage') }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: prescription.dosage })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.duration') }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: prescription.duration })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.instructions') }), _jsx("p", { className: "mt-1 whitespace-pre-wrap break-words text-sm text-foreground", children: prescription.instructions?.trim() || t('labels.noInstructions') })] })] })] }, prescription.id));
                }) }))] }));
}
