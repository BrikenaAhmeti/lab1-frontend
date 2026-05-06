import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser, isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import { useCreateMedicalRecord, useMedicalRecord, useUpdateMedicalRecord, } from '@/domain/medical-records/medical-records.hooks';
import { getMedicalRecordApiMessage, getMedicalRecordApiStatus, getMedicalRecordDoctorOptionLabel, getMedicalRecordPatientOptionLabel, medicalRecordDatePattern, withFallbackOption, } from '@/domain/medical-records/medical-records.utils';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import MedicalRecordStateCard from './state-card';
const emptyForm = {
    patientId: '',
    doctorId: '',
    diagnosis: '',
    treatment: '',
    prescriptionsText: '',
    date: '',
};
function validateForm(values, t) {
    const errors = {};
    if (!values.patientId.trim())
        errors.patientId = t('validation.required');
    if (!values.doctorId.trim())
        errors.doctorId = t('validation.required');
    if (!values.diagnosis.trim())
        errors.diagnosis = t('validation.required');
    if (!values.treatment.trim())
        errors.treatment = t('validation.required');
    if (!values.date.trim())
        errors.date = t('validation.required');
    if (values.date && !medicalRecordDatePattern.test(values.date)) {
        errors.date = t('validation.date');
    }
    return errors;
}
function getBackPath(patientId) {
    return patientId.trim()
        ? `/app/medical-records?patientId=${encodeURIComponent(patientId.trim())}`
        : '/app/medical-records';
}
export default function MedicalRecordFormPage() {
    const { t } = useTranslation('medicalRecords');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const [searchParams] = useSearchParams();
    const patientIdFromQuery = searchParams.get('patientId')?.trim() ?? '';
    const isEdit = !!id;
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const userId = useAppSelector((state) => state.auth.user?.id ?? '');
    const canManage = isDoctorOrAdminUser(roles);
    const isAdmin = isAdminUser(roles);
    const recordQuery = useMedicalRecord(id);
    const doctorsQuery = useDoctors();
    const [patientSearch, setPatientSearch] = useState('');
    const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
    const [form, setForm] = useState({
        ...emptyForm,
        patientId: patientIdFromQuery,
    });
    const selectedPatientQuery = usePatient(form.patientId);
    const createMedicalRecord = useCreateMedicalRecord();
    const updateMedicalRecord = useUpdateMedicalRecord();
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getMedicalRecordApiStatus(recordQuery.error);
    const saving = createMedicalRecord.isPending || updateMedicalRecord.isPending;
    const currentDoctor = (doctorsQuery.data ?? []).find((doctor) => doctor.userId === userId);
    useEffect(() => {
        if (!isEdit && patientIdFromQuery && !form.patientId) {
            setForm((current) => ({ ...current, patientId: patientIdFromQuery }));
        }
    }, [form.patientId, isEdit, patientIdFromQuery]);
    useEffect(() => {
        if (!isEdit && !isAdmin && currentDoctor?.id && !form.doctorId) {
            setForm((current) => ({ ...current, doctorId: currentDoctor.id }));
        }
    }, [currentDoctor?.id, form.doctorId, isAdmin, isEdit]);
    useEffect(() => {
        if (!isEdit || !recordQuery.data) {
            return;
        }
        setForm({
            patientId: recordQuery.data.patientId,
            doctorId: recordQuery.data.doctorId,
            diagnosis: recordQuery.data.diagnosis,
            treatment: recordQuery.data.treatment,
            prescriptionsText: recordQuery.data.prescriptionsText ?? '',
            date: recordQuery.data.recordDate,
        });
    }, [isEdit, recordQuery.data]);
    const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: getMedicalRecordPatientOptionLabel(patient),
    }));
    const selectedPatientLabel = patientOptions.find((option) => option.value === form.patientId)?.label
        ?? (selectedPatientQuery.data
            ? getMedicalRecordPatientOptionLabel(selectedPatientQuery.data)
            : form.patientId);
    const patientSelectOptions = withFallbackOption(patientOptions, form.patientId, selectedPatientLabel);
    const doctorOptions = (doctorsQuery.data ?? []).map((doctor) => ({
        value: doctor.id,
        label: getMedicalRecordDoctorOptionLabel(doctor),
    }));
    const selectedDoctorLabel = doctorOptions.find((option) => option.value === form.doctorId)?.label
        ?? (recordQuery.data?.doctor
            ? getMedicalRecordDoctorOptionLabel(recordQuery.data.doctor)
            : currentDoctor
                ? getMedicalRecordDoctorOptionLabel(currentDoctor)
                : form.doctorId);
    const doctorSelectOptions = withFallbackOption(doctorOptions, form.doctorId, selectedDoctorLabel);
    const handleChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canManage) {
            return;
        }
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        const payload = {
            patientId: form.patientId.trim(),
            doctorId: form.doctorId.trim(),
            diagnosis: form.diagnosis.trim(),
            treatment: form.treatment.trim(),
            prescriptionsText: form.prescriptionsText.trim() || null,
            date: form.date,
        };
        try {
            const record = isEdit
                ? await updateMedicalRecord.mutateAsync({ id, payload })
                : await createMedicalRecord.mutateAsync(payload);
            navigate(getBackPath(record.patientId), {
                replace: true,
                state: { success: isEdit ? t('messages.updated') : t('messages.created') },
            });
        }
        catch (error) {
            setFormError(getMedicalRecordApiMessage(error, t('errors.save'), {
                400: t('errors.invalidData'),
                403: t('errors.writeForbidden'),
                404: t('errors.notFound'),
            }));
        }
    };
    if (!canManage) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.writeForbiddenTitle'), description: t('states.writeForbiddenDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate(getBackPath(patientIdFromQuery)), children: t('actions.back') }) }));
    }
    if (isEdit && recordQuery.isLoading) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.loadingRecordTitle'), description: t('states.loadingRecordDescription') }));
    }
    if (isEdit && status === 401) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(MedicalRecordStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate(getBackPath(patientIdFromQuery)), children: t('actions.back') }) }));
    }
    if (isEdit && recordQuery.error) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.errorTitle'), description: getMedicalRecordApiMessage(recordQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => recordQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (doctorsQuery.isLoading || patientsQuery.isLoading) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.loadingOptionsTitle'), description: t('states.loadingOptionsDescription') }));
    }
    if (doctorsQuery.error) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.errorTitle'), description: getMedicalRecordApiMessage(doctorsQuery.error, t('errors.doctors')), children: _jsx(Button, { variant: "outline", onClick: () => doctorsQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (!patientSelectOptions.length && !selectedPatientQuery.data) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.emptyPatientsTitle'), description: t('states.emptyPatientsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/patients'), children: t('actions.viewPatients') }) }));
    }
    if (!doctorSelectOptions.length) {
        return (_jsx(MedicalRecordStateCard, { title: t('states.emptyDoctorsTitle'), description: t('states.emptyDoctorsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.viewDoctors') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate(getBackPath(form.patientId
                            || recordQuery.data?.patientId
                            || patientIdFromQuery)), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { name: "patientSearch", label: t('fields.patientSearch'), value: patientSearch, placeholder: t('form.patientSearchPlaceholder'), onChange: (event) => setPatientSearch(event.target.value) }), _jsxs(Select, { required: true, name: "patientId", label: t('fields.patient'), value: form.patientId, error: errors.patientId, hint: patientsQuery.isLoading ? t('labels.loadingPatients') : undefined, onChange: (event) => handleChange('patientId', event.target.value), children: [_jsx("option", { value: "", children: t('form.patientPlaceholder') }), patientSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsxs(Select, { required: true, name: "doctorId", label: t('fields.doctor'), value: form.doctorId, error: errors.doctorId, hint: doctorsQuery.isLoading ? t('labels.loadingDoctors') : undefined, onChange: (event) => handleChange('doctorId', event.target.value), children: [_jsx("option", { value: "", children: t('form.doctorPlaceholder') }), doctorSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsx(Input, { required: true, type: "date", name: "date", label: t('fields.recordDate'), value: form.date, error: errors.date, onChange: (event) => handleChange('date', event.target.value) }), _jsx(Input, { required: true, name: "diagnosis", label: t('fields.diagnosis'), value: form.diagnosis, error: errors.diagnosis, onChange: (event) => handleChange('diagnosis', event.target.value) })] }), _jsx(Textarea, { required: true, name: "treatment", label: t('fields.treatment'), value: form.treatment, error: errors.treatment, onChange: (event) => handleChange('treatment', event.target.value) }), _jsx(Textarea, { name: "prescriptionsText", label: t('fields.prescriptionsText'), value: form.prescriptionsText, placeholder: t('form.prescriptionsPlaceholder'), onChange: (event) => handleChange('prescriptionsText', event.target.value) }), formError ? _jsx("p", { className: "text-sm text-danger", children: formError }) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') }), _jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(getBackPath(form.patientId
                                        || recordQuery.data?.patientId
                                        || patientIdFromQuery)), children: t('actions.cancel') })] })] }) })] }));
}
