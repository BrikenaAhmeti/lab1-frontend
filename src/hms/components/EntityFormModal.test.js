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
        fireEvent.change(screen.getByLabelText('Phone'), {
            target: { value: '+38344111222' },
        });
        fireEvent.click(screen.getByRole('combobox', { name: /Blood group/i }));
        fireEvent.click(screen.getByRole('option', { name: /^O\+$/ }));
        fireEvent.change(screen.getByLabelText('Address'), {
            target: { value: 'Prishtina' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1990-05-12',
                gender: 'MALE',
                phone: '+38344111222',
                blood_group: 'O+',
                address: 'Prishtina',
            }));
        });
    });
});
