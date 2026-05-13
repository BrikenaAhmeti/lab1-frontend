import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { moduleConfigs } from '../modules';
import EntityFormModal from './EntityFormModal';
describe('EntityFormModal', () => {
    it('submits patient values', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(_jsx(LanguageProvider, { children: _jsx(EntityFormModal, { open: true, mode: "create", config: moduleConfigs.patients, item: null, references: {}, loading: false, saving: false, onClose: vi.fn(), onSubmit: onSubmit }) }));
        fireEvent.change(screen.getByLabelText('First name'), {
            target: { value: 'John' },
        });
        fireEvent.change(screen.getByLabelText('Last name'), {
            target: { value: 'Doe' },
        });
        fireEvent.change(screen.getByLabelText('Date of birth'), {
            target: { value: '1990-05-12' },
        });
        fireEvent.click(screen.getByRole('combobox', { name: /Gender/i }));
        fireEvent.click(screen.getByRole('option', { name: /^Male$/i }));
        fireEvent.change(screen.getByLabelText('Phone number'), {
            target: { value: '+38344111222' },
        });
        fireEvent.click(screen.getByRole('combobox', { name: /Blood type/i }));
        fireEvent.click(screen.getByRole('option', { name: /^O\+$/ }));
        fireEvent.change(screen.getByLabelText('Address'), {
            target: { value: 'Prishtina' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-05-12',
                gender: 'MALE',
                phoneNumber: '+38344111222',
                bloodType: 'O+',
                address: 'Prishtina',
            }));
        });
    });
    it('submits doctor create values without userId when creating a new linked user', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(_jsx(LanguageProvider, { children: _jsx(EntityFormModal, { open: true, mode: "create", config: moduleConfigs.doctors, item: null, references: {
                    users: [{ value: 'user-1', label: 'Ava Taylor' }],
                    departments: [{ value: 'dep-1', label: 'Cardiology' }],
                }, loading: false, saving: false, onClose: vi.fn(), onSubmit: onSubmit }) }));
        fireEvent.click(screen.getByRole('combobox', { name: /Account setup/i }));
        fireEvent.click(screen.getByRole('option', { name: /Create new login/i }));
        fireEvent.change(screen.getByLabelText('First name'), {
            target: { value: 'Ava' },
        });
        fireEvent.change(screen.getByLabelText('Last name'), {
            target: { value: 'Taylor' },
        });
        fireEvent.change(screen.getByLabelText('Specialization'), {
            target: { value: 'Cardiology' },
        });
        fireEvent.click(screen.getByRole('combobox', { name: /Department/i }));
        fireEvent.click(screen.getByRole('option', { name: /^Cardiology$/i }));
        fireEvent.change(screen.getByLabelText('Phone number'), {
            target: { value: '+38344111222' },
        });
        fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), {
            target: { value: 'ava@example.com' },
        });
        fireEvent.change(screen.getByRole('textbox', { name: /Username/i }), {
            target: { value: 'avataylor' },
        });
        const passwordInput = document.getElementById('password');
        expect(passwordInput).not.toBeNull();
        fireEvent.change(passwordInput, {
            target: { value: 'secret123' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
                accountMode: 'new',
                firstName: 'Ava',
                lastName: 'Taylor',
                specialization: 'Cardiology',
                departmentId: 'dep-1',
                phoneNumber: '+38344111222',
                email: 'ava@example.com',
                username: 'avataylor',
                password: 'secret123',
            }));
        });
    });
});
