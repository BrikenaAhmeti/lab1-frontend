import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoomFormPage from '@/pages/Dashboard/rooms/form';
const mockUseRoom = vi.fn();
const mockUseCreateRoom = vi.fn();
const mockUseUpdateRoom = vi.fn();
const mockUseDepartments = vi.fn();
vi.mock('@/domain/rooms/rooms.hooks', () => ({
    useRoom: (id) => mockUseRoom(id),
    useCreateRoom: () => mockUseCreateRoom(),
    useUpdateRoom: () => mockUseUpdateRoom(),
}));
vi.mock('@/domain/departments/departments.hooks', () => ({
    useDepartments: () => mockUseDepartments(),
}));
const createRoomMock = vi.fn();
const updateRoomMock = vi.fn();
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
function renderPage(route) {
    const preloadedState = {
        auth: {
            user: createUser(['ADMIN']),
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
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsxs(Routes, { children: [_jsx(Route, { path: "/app/rooms/new", element: _jsx(RoomFormPage, {}) }), _jsx(Route, { path: "/app/rooms/:id/edit", element: _jsx(RoomFormPage, {}) }), _jsx(Route, { path: "/app/rooms", element: _jsx("div", { children: "Rooms list" }) })] }) }) }));
}
describe('RoomFormPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createRoomMock.mockReset();
        updateRoomMock.mockReset();
        createRoomMock.mockResolvedValue({ id: 'room-1' });
        updateRoomMock.mockResolvedValue({ id: 'room-1' });
        mockUseRoom.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseCreateRoom.mockReturnValue({
            mutateAsync: createRoomMock,
            isPending: false,
        });
        mockUseUpdateRoom.mockReturnValue({
            mutateAsync: updateRoomMock,
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
        renderPage('/app/rooms/new');
        fireEvent.change(screen.getByLabelText('Room number'), {
            target: { value: ' 101A ' },
        });
        fireEvent.change(screen.getByLabelText('Department'), {
            target: { value: 'dep-1' },
        });
        fireEvent.change(screen.getByLabelText('Type'), {
            target: { value: 'ICU' },
        });
        fireEvent.change(screen.getByLabelText('Capacity'), {
            target: { value: '4' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save room/i }));
        await waitFor(() => {
            expect(createRoomMock).toHaveBeenCalledWith({
                roomNumber: '101A',
                departmentId: 'dep-1',
                type: 'ICU',
                status: 'AVAILABLE',
                capacity: 4,
            });
        });
    });
    it('submits the edit form with normalized values', async () => {
        mockUseRoom.mockReturnValue({
            data: {
                id: 'room-1',
                roomNumber: '201',
                departmentId: 'dep-1',
                type: 'general',
                status: 'under_maintenance',
                capacity: 2,
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        renderPage('/app/rooms/room-1/edit');
        fireEvent.change(screen.getByLabelText('Capacity'), {
            target: { value: '5' },
        });
        fireEvent.click(screen.getByRole('button', { name: /update room/i }));
        await waitFor(() => {
            expect(updateRoomMock).toHaveBeenCalledWith({
                id: 'room-1',
                payload: {
                    roomNumber: '201',
                    departmentId: 'dep-1',
                    type: 'GENERAL',
                    status: 'UNDER_MAINTENANCE',
                    capacity: 5,
                },
            });
        });
    });
});
