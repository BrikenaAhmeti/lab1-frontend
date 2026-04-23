import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreatePatient, usePatient, useUpdatePatient } from '@/domain/patients/patients.hooks';
import { getPatientApiMessage, getPatientApiStatus, patientBloodTypes, patientDatePattern, patientGenders, patientPhonePattern, } from '@/domain/patients/patients.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import PatientStateCard from './state-card';
const emptyForm = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    bloodType: '',
};
function validateForm(values, t) {
    const errors = {};
    if (!values.firstName.trim())
        errors.firstName = t('validation.required');
    if (!values.lastName.trim())
        errors.lastName = t('validation.required');
    if (!values.dateOfBirth.trim())
        errors.dateOfBirth = t('validation.required');
    if (!values.gender.trim())
        errors.gender = t('validation.required');
    if (!values.phoneNumber.trim())
        errors.phoneNumber = t('validation.required');
    if (!values.address.trim())
        errors.address = t('validation.required');
    if (!values.bloodType.trim())
        errors.bloodType = t('validation.required');
    if (values.dateOfBirth && !patientDatePattern.test(values.dateOfBirth)) {
        errors.dateOfBirth = t('validation.dateOfBirth');
    }
    if (values.phoneNumber && !patientPhonePattern.test(values.phoneNumber)) {
        errors.phoneNumber = t('validation.phoneNumber');
    }
    return errors;
}
export default function PatientFormPage() {
    const { t } = useTranslation('patients');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const isEdit = !!id;
    const patientQuery = usePatient(id);
    const createPatient = useCreatePatient();
    const updatePatient = useUpdatePatient();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getPatientApiStatus(patientQuery.error);
    const saving = createPatient.isPending || updatePatient.isPending;
    useEffect(() => {
        if (!isEdit || !patientQuery.data) {
            return;
        }
        setForm({
            firstName: patientQuery.data.firstName,
            lastName: patientQuery.data.lastName,
            dateOfBirth: patientQuery.data.dateOfBirth,
            gender: patientQuery.data.gender,
            phoneNumber: patientQuery.data.phoneNumber,
            address: patientQuery.data.address,
            bloodType: patientQuery.data.bloodType,
        });
    }, [isEdit, patientQuery.data]);
    const handleChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            phoneNumber: form.phoneNumber.trim(),
            address: form.address.trim(),
            bloodType: form.bloodType,
        };
        try {
            const patient = isEdit
                ? await updatePatient.mutateAsync({ id, payload })
                : await createPatient.mutateAsync(payload);
            navigate(`/app/patients/${patient.id}`, { replace: true });
        }
        catch (error) {
            setFormError(getPatientApiMessage(error, t('errors.save')));
        }
    };
    if (isEdit && patientQuery.isLoading) {
        return (_jsx(PatientStateCard, { title: t('states.loadingPatientTitle'), description: t('states.loadingPatientDescription') }));
    }
    if (isEdit && status === 401) {
        return (_jsx(PatientStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(PatientStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(PatientStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/patients'), children: t('actions.back') }) }));
    }
    if (isEdit && patientQuery.error) {
        return (_jsx(PatientStateCard, { title: t('states.errorTitle'), description: getPatientApiMessage(patientQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => patientQuery.refetch(), children: t('actions.retry') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate(isEdit ? `/app/patients/${id}` : '/app/patients'), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { required: true, name: "firstName", label: t('fields.firstName'), value: form.firstName, error: errors.firstName, onChange: (event) => handleChange('firstName', event.target.value) }), _jsx(Input, { required: true, name: "lastName", label: t('fields.lastName'), value: form.lastName, error: errors.lastName, onChange: (event) => handleChange('lastName', event.target.value) }), _jsx(Input, { required: true, type: "date", name: "dateOfBirth", label: t('fields.dateOfBirth'), value: form.dateOfBirth, error: errors.dateOfBirth, onChange: (event) => handleChange('dateOfBirth', event.target.value) }), _jsxs(Select, { required: true, name: "gender", label: t('fields.gender'), value: form.gender, error: errors.gender, onChange: (event) => handleChange('gender', event.target.value), children: [_jsx("option", { value: "", children: t('form.genderPlaceholder') }), patientGenders.map((gender) => (_jsx("option", { value: gender, children: t(`genders.${gender}`) }, gender)))] }), _jsx(Input, { required: true, type: "tel", name: "phoneNumber", label: t('fields.phoneNumber'), value: form.phoneNumber, error: errors.phoneNumber, placeholder: "+38344111222", onChange: (event) => handleChange('phoneNumber', event.target.value) }), _jsxs(Select, { required: true, name: "bloodType", label: t('fields.bloodType'), value: form.bloodType, error: errors.bloodType, onChange: (event) => handleChange('bloodType', event.target.value), children: [_jsx("option", { value: "", children: t('form.bloodTypePlaceholder') }), patientBloodTypes.map((bloodType) => (_jsx("option", { value: bloodType, children: bloodType }, bloodType)))] })] }), _jsx(Textarea, { required: true, name: "address", label: t('fields.address'), value: form.address, error: errors.address, onChange: (event) => handleChange('address', event.target.value) }), formError ? _jsx("p", { className: "text-sm text-danger", children: formError }) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') }), _jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(isEdit ? `/app/patients/${id}` : '/app/patients'), children: t('actions.cancel') })] })] }) })] }));
}
