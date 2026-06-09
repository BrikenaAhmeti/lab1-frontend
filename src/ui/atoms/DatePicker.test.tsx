import { fireEvent, render, screen } from '@testing-library/react';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
  it('lets users jump to a birth year before choosing the day', () => {
    const onChange = vi.fn();

    render(<DatePicker label="Date of birth" name="dateOfBirth" onChange={onChange} />);

    fireEvent.focus(screen.getByLabelText('Date of birth'));
    fireEvent.change(screen.getByLabelText('Year'), {
      target: { value: '1990' },
    });
    fireEvent.change(screen.getByLabelText('Month'), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: '12' }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'dateOfBirth',
          value: '1990-05-12',
        }),
      })
    );
  });
});
