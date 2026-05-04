import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NurseFormPage from '@/pages/Dashboard/nurses/form';
const mockUseNurse = vi.fn();
const mockUseCreateNurse = vi.fn();
const mockUseUpdateNurse = vi.fn();
const mockUseDepartments = vi.fn();
vi.mock('@/domain/nurses/nurses.hooks', () => ({
    useNurse: (id) => mockUseNurse(id),
    useCreateNurse: () => mockUseCreateNurse(),
    useUpdateNurse: () => mockUseUpdateNurse(),
}));
vi.mock('@/domain/departments/departments.hooks', () => ({
    useDepartments: () => mockUseDepartments(),
}));
const createNurseMock = vi.fn();
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
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/app/nurses/new", element: _jsx(NurseFormPage, {}) }), _jsx(Route, { path: "/app/nurses/:id", element: _jsx("div", { children: "Nurse details" }) }), _jsx(Route, { path: "/app/nurses/:id/edit", element: _jsx(NurseFormPage, {}) })] }) }) }));
}
describe('NurseFormPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createNurseMock.mockReset();
        createNurseMock.mockResolvedValue({ id: 'nurse-1' });
        mockUseNurse.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseCreateNurse.mockReturnValue({
            mutateAsync: createNurseMock,
            isPending: false,
        });
        mockUseUpdateNurse.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        });
        mockUseDepartments.mockReturnValue({
            data: [
                {
                    id: 'dep-1',
                    name: 'Cardiology',
                    location: 'Floor 2',
                },
            ],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });
    it('submits the create form with trimmed values', async () => {
        renderPage('/app/nurses/new');
        fireEvent.change(screen.getByLabelText('First name'), {
            target: { value: ' Ava ' },
        });
        fireEvent.change(screen.getByLabelText('Last name'), {
            target: { value: ' Taylor ' },
        });
        fireEvent.change(screen.getByLabelText('Department'), {
            target: { value: 'dep-1' },
        });
        fireEvent.change(screen.getByLabelText('Shift'), {
            target: { value: 'Night' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save nurse/i }));
        await waitFor(() => {
            expect(createNurseMock).toHaveBeenCalledWith({
                firstName: 'Ava',
                lastName: 'Taylor',
                departmentId: 'dep-1',
                shift: 'Night',
            });
        });
    });
});
