import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NursesListPage from '@/pages/Dashboard/nurses';
const mockUseNurses = vi.fn();
const mockUseDeleteNurse = vi.fn();
const mockUseDepartments = vi.fn();
vi.mock('@/domain/nurses/nurses.hooks', () => ({
    useNurses: (params) => mockUseNurses(params),
    useDeleteNurse: () => mockUseDeleteNurse(),
}));
vi.mock('@/domain/departments/departments.hooks', () => ({
    useDepartments: () => mockUseDepartments(),
}));
function renderPage(route) {
    const preloadedState = {
        auth: {
            user: null,
            tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
            finishedGetStarted: false,
            loading: false,
            initialized: true,
            error: null,
        },
        transactions: {
            page: null,
            byId: {},
            loading: false,
            error: undefined,
        },
        authChat: {
            chatId: null,
            messages: [],
            loading: false,
            error: null,
        },
    };
    const store = configureStore({
        reducer: {
            auth: (state = preloadedState.auth) => state,
            transactions: (state = preloadedState.transactions) => state,
            authChat: (state = preloadedState.authChat) => state,
        },
        preloadedState,
    });
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsx(NursesListPage, {}) }) }));
}
describe('NursesListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseNurses.mockReturnValue({
            data: [
                {
                    id: 'nurse-1',
                    firstName: 'Ava',
                    lastName: 'Taylor',
                    departmentId: 'dep-1',
                    shift: 'Morning',
                    department: {
                        id: 'dep-1',
                        name: 'Cardiology',
                        location: 'Floor 2',
                    },
                },
                {
                    id: 'nurse-2',
                    firstName: 'Mia',
                    lastName: 'Lopez',
                    departmentId: 'dep-2',
                    shift: 'Night',
                    department: {
                        id: 'dep-2',
                        name: 'Emergency',
                        location: 'Floor 1',
                    },
                },
            ],
            isLoading: false,
            isFetching: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseDeleteNurse.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
            variables: null,
        });
        mockUseDepartments.mockReturnValue({
            data: [
                {
                    id: 'dep-1',
                    name: 'Cardiology',
                    location: 'Floor 2',
                },
                {
                    id: 'dep-2',
                    name: 'Emergency',
                    location: 'Floor 1',
                },
            ],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });
    it('passes the selected department filter to the nurses query', () => {
        renderPage('/app/nurses?departmentId=dep-2');
        expect(mockUseNurses).toHaveBeenCalledWith({ departmentId: 'dep-2' });
        expect(screen.getByLabelText('Department')).toHaveValue('dep-2');
    });
    it('shows only nurses matching the selected shift filter', () => {
        renderPage('/app/nurses?shift=Night');
        expect(screen.getByText('Mia Lopez')).toBeInTheDocument();
        expect(screen.queryByText('Ava Taylor')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create nurse/i })).toBeInTheDocument();
    });
});
