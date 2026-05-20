import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Select from './Select';

const originalInnerHeight = window.innerHeight;

function mockViewportHeight(height: number) {
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
}

function mockRect(top: number, bottom: number): DOMRect {
  return {
    bottom,
    height: bottom - top,
    left: 0,
    right: 160,
    top,
    width: 160,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function renderSelect() {
  render(
    <Select label="Rows per page" value="10" onChange={() => {}}>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
    </Select>
  );

  const button = screen.getByRole('combobox', { name: 'Rows per page' });
  const root = button.parentElement;

  if (!root) {
    throw new Error('Expected select root to be rendered');
  }

  return { button, root };
}

afterEach(() => {
  vi.restoreAllMocks();
  mockViewportHeight(originalInnerHeight);
});

describe('Select', () => {
  it('opens upward when there is not enough visible space below', () => {
    mockViewportHeight(500);
    const { button, root } = renderSelect();
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(mockRect(440, 486));

    fireEvent.click(button);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass('bottom-full');
    expect(listbox).toHaveStyle({ maxHeight: '240px' });
  });

  it('caps the dropdown height to the visible space below', () => {
    mockViewportHeight(180);
    const { button, root } = renderSelect();
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(mockRect(20, 60));

    fireEvent.click(button);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass('top-full');
    expect(listbox).toHaveStyle({ maxHeight: '108px' });
  });
});
