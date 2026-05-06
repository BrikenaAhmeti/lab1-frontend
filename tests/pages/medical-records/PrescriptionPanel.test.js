import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrescriptionPanel from '@/pages/Dashboard/medical-records/prescription-panel';
const mockUseMedicalRecordPrescriptions = vi.fn();
const mockUseCreatePrescription = vi.fn();
const mockUseUpdatePrescription = vi.fn();
const mockUseDeletePrescription = vi.fn();
vi.mock('@/domain/medical-records/medical-records.hooks', () => ({
    useMedicalRecordPrescriptions: () => mockUseMedicalRecordPrescriptions(),
    useCreatePrescription: () => mockUseCreatePrescription(),
    useUpdatePrescription: () => mockUseUpdatePrescription(),
    useDeletePrescription: () => mockUseDeletePrescription(),
}));
const createPrescriptionMock = vi.fn();
const updatePrescriptionMock = vi.fn();
const deletePrescriptionMock = vi.fn();
const prescriptions = [
    {
        id: 'prescription-1',
        medicalRecordId: 'record-1',
        medicine: 'Amoxicillin',
        dosage: '500mg twice daily',
        duration: '7 days',
        instructions: 'After meals',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
    },
];
function renderPanel(canManage = true) {
    return render(_jsx(PrescriptionPanel, { medicalRecordId: "record-1", canManage: canManage }));
}
describe('PrescriptionPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'print', {
            configurable: true,
            writable: true,
            value: vi.fn(),
        });
        Object.defineProperty(window, 'confirm', {
            configurable: true,
            writable: true,
            value: vi.fn(() => true),
        });
        createPrescriptionMock.mockResolvedValue({
            id: 'prescription-2',
            medicalRecordId: 'record-1',
        });
        updatePrescriptionMock.mockResolvedValue({
            id: 'prescription-1',
            medicalRecordId: 'record-1',
        });
        deletePrescriptionMock.mockResolvedValue('record-1');
        mockUseMedicalRecordPrescriptions.mockReturnValue({
            data: prescriptions,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });
        mockUseCreatePrescription.mockReturnValue({
            mutateAsync: createPrescriptionMock,
            isPending: false,
        });
        mockUseUpdatePrescription.mockReturnValue({
            mutateAsync: updatePrescriptionMock,
            isPending: false,
        });
        mockUseDeletePrescription.mockReturnValue({
            mutateAsync: deletePrescriptionMock,
            isPending: false,
            variables: null,
        });
    });
    it('shows prescriptions in view-only mode without write actions', () => {
        renderPanel(false);
        expect(screen.getAllByText('Amoxicillin')).toHaveLength(2);
        expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /add prescription/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    });
    it('creates a prescription with trimmed values', async () => {
        renderPanel(true);
        fireEvent.click(screen.getByRole('button', { name: /add prescription/i }));
        fireEvent.change(screen.getByLabelText('Medicine'), {
            target: { value: ' Amoxicillin ' },
        });
        fireEvent.change(screen.getByLabelText('Dosage'), {
            target: { value: ' 500mg twice daily ' },
        });
        fireEvent.change(screen.getByLabelText('Duration'), {
            target: { value: ' 7 days ' },
        });
        fireEvent.change(screen.getByLabelText('Instructions'), {
            target: { value: ' After meals ' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save prescription/i }));
        await waitFor(() => {
            expect(createPrescriptionMock).toHaveBeenCalledWith({
                medicalRecordId: 'record-1',
                medicine: 'Amoxicillin',
                dosage: '500mg twice daily',
                duration: '7 days',
                instructions: 'After meals',
            });
        });
    });
    it('updates, deletes, and prints prescriptions for managers', async () => {
        renderPanel(true);
        fireEvent.click(screen.getByRole('button', { name: /print/i }));
        expect(window.print).toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
        fireEvent.change(screen.getByLabelText('Dosage'), {
            target: { value: ' 250mg twice daily ' },
        });
        fireEvent.click(screen.getByRole('button', { name: /update prescription/i }));
        await waitFor(() => {
            expect(updatePrescriptionMock).toHaveBeenCalledWith({
                id: 'prescription-1',
                payload: {
                    medicine: 'Amoxicillin',
                    dosage: '250mg twice daily',
                    duration: '7 days',
                    instructions: 'After meals',
                },
            });
        });
        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        await waitFor(() => {
            expect(deletePrescriptionMock).toHaveBeenCalledWith({
                id: 'prescription-1',
                medicalRecordId: 'record-1',
            });
        });
    });
});
