import '@/config/i18n';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DepartmentsListPage from './index';

const mockUseDepartments = vi.fn();
const mockUseDeleteDepartment = vi.fn();

vi.mock('@/domain/departments/departments.hooks', () => ({
  useDepartments: () => mockUseDepartments(),
  useDeleteDepartment: () => mockUseDeleteDepartment(),
}));

function renderPage(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DepartmentsListPage />
    </MemoryRouter>
  );
}

describe('DepartmentsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDepartments.mockReturnValue({
      data: [
        {
          id: 'dep-1',
          name: 'Cardiology',
          location: 'North Wing',
          description: 'Heart care unit',
          isActive: true,
        },
        {
          id: 'dep-2',
          name: 'Neurology',
          location: 'East Clinic',
          description: 'Brain and nerve care',
          isActive: false,
        },
        {
          id: 'dep-3',
          name: 'Pediatrics',
          location: 'South Wing',
          description: 'Children health services',
          isActive: true,
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseDeleteDepartment.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      variables: null,
    });
  });

  it.each([
    ['department name', 'cardio', 'Cardiology'],
    ['location', 'east clinic', 'Neurology'],
    ['description', 'children', 'Pediatrics'],
  ])('filters departments by %s', (_field, query, expectedName) => {
    renderPage(`/app/departments?q=${encodeURIComponent(query)}`);

    expect(screen.getByText(expectedName)).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(1);
  });

  it('shows a filtered empty state when no department fields match', () => {
    renderPage('/app/departments?q=surgery');

    expect(screen.getByText('No departments match this search')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /clear search/i })).toHaveLength(2);
    expect(screen.queryByText('Cardiology')).not.toBeInTheDocument();
  });
});
