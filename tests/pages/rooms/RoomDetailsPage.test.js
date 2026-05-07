import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoomDetailsPage from '@/pages/Dashboard/rooms/details';
const mockUseRoom = vi.fn();
vi.mock('@/domain/rooms/rooms.hooks', () => ({
    useRoom: (id) => mockUseRoom(id),
}));
function createUser(roles) {
    return {
        id: 'u-1',
        firstName: 'Ava',
        lastName: 'Taylor',
        email: 'ava@example.com',
        phoneNumber: null,
        emailConfirmed: true,
        isActive: true,
        lockoutEnabled: false,
        accessFailedCount: 0,
        roles,
        createdAt: '2026-04-16T00:00:00.000Z',
        updatedAt: '2026-04-16T00:00:00.000Z',
    };
}
function renderPage(route, roles) {
    const preloadedState = {
        auth: {
            user: createUser(roles),
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
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/app/rooms/:id", element: _jsx(RoomDetailsPage, {}) }), _jsx(Route, { path: "/app/rooms", element: _jsx("div", { children: "Rooms list" }) }), _jsx(Route, { path: "/app/departments/:id", element: _jsx("div", { children: "Department details" }) })] }) }) }));
}
describe('RoomDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseRoom.mockReturnValue({
            data: {
                id: 'room-1',
                roomNumber: '101',
                departmentId: 'dep-1',
                type: 'GENERAL',
                status: 'AVAILABLE',
                capacity: 3,
                activeAdmissionsCount: 2,
                availableCapacity: 1,
                department: {
                    id: 'dep-1',
                    name: 'Cardiology',
                    location: 'Floor 2',
                },
                currentAdmissions: [
                    {
                        id: 'admission-1',
                        status: 'ACTIVE',
                        admissionDate: '2099-10-10T00:00:00.000Z',
                        patient: {
                            id: 'patient-1',
                            firstName: 'Lena',
                            lastName: 'Morris',
                        },
                    },
                ],
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
    });
    it('renders room information and the current admissions list', () => {
        renderPage('/app/rooms/room-1', ['ADMIN']);
        expect(screen.getByRole('heading', { name: '101' })).toBeInTheDocument();
        expect(screen.getByText('Room details')).toBeInTheDocument();
        expect(screen.getByText('Current admissions')).toBeInTheDocument();
        expect(screen.getByText('Lena Morris')).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        expect(screen.getByText(/2099/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Edit$/i })).toBeInTheDocument();
    });
});
