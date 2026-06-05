import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { moduleConfigs } from '@/config/modules';
import EntityFormModal from './EntityFormModal';

describe('EntityFormModal', () => {
  it('submits patient values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LanguageProvider>
        <EntityFormModal
          open
          mode="create"
          config={moduleConfigs.patients}
          item={null}
          references={{}}
          loading={false}
          saving={false}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </LanguageProvider>
    );

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
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-05-12',
          gender: 'MALE',
          phoneNumber: '+38344111222',
          bloodType: 'O+',
          address: 'Prishtina',
        })
      );
    });
  });

  it('submits doctor create values with email for backend account provisioning', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LanguageProvider>
        <EntityFormModal
          open
          mode="create"
          config={moduleConfigs.doctors}
          item={null}
          references={{
            departments: [{ value: 'dep-1', label: 'Cardiology' }],
          }}
          loading={false}
          saving={false}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </LanguageProvider>
    );

    expect(screen.queryByRole('combobox', { name: /Account setup/i })).not.toBeInTheDocument();
    expect(document.getElementById('password')).toBeNull();
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

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Ava',
          lastName: 'Taylor',
          specialization: 'Cardiology',
          departmentId: 'dep-1',
          phoneNumber: '+38344111222',
          email: 'ava@example.com',
          username: 'avataylor',
        })
      );
    });
  });

  it('prefills appointment edit date and time from appointment fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LanguageProvider>
        <EntityFormModal
          open
          mode="edit"
          config={moduleConfigs.appointments}
          item={{
            id: 'appointment-1',
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            appointmentDate: '2099-10-10T00:00:00.000Z',
            appointmentTime: '10:30',
            status: 'Scheduled',
            notes: 'Bring reports',
          }}
          references={{
            patients: [{ value: 'patient-1', label: 'Lena Morris' }],
            doctors: [{ value: 'doctor-1', label: 'Ava Taylor' }],
          }}
          loading={false}
          saving={false}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </LanguageProvider>
    );

    expect(screen.getByLabelText('Date')).toHaveValue('2099-10-10');
    expect(screen.getByLabelText('Time')).toHaveValue('10:30');

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 'patient-1',
          doctorId: 'doctor-1',
          date: '2099-10-10',
          time: '10:30',
          status: 'Scheduled',
          notes: 'Bring reports',
        })
      );
    });
  });
});
