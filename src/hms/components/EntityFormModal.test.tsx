import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { moduleConfigs } from '../modules';
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
    fireEvent.change(screen.getByLabelText('Gender'), {
      target: { value: 'MALE' },
    });
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '+38344111222' },
    });
    fireEvent.change(screen.getByLabelText('Blood group'), {
      target: { value: 'O+' },
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: 'Prishtina' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-05-12',
          gender: 'MALE',
          phone: '+38344111222',
          blood_group: 'O+',
          address: 'Prishtina',
        })
      );
    });
  });
});
