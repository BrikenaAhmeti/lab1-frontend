import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrescriptionPanel from '@/pages/Dashboard/medical-records/prescription-panel';

const mockDownloadPrescriptionPdf = vi.hoisted(() => vi.fn());
const mockUseMedicalRecordPrescriptions = vi.fn();
const mockUseCreatePrescription = vi.fn();
const mockUseUpdatePrescription = vi.fn();
const mockUseDeletePrescription = vi.fn();

vi.mock('@/domain/medical-records/prescriptions.pdf', () => ({
  downloadPrescriptionPdf: mockDownloadPrescriptionPdf,
}));

vi.mock('@/domain/medical-records/medical-records.hooks', () => ({
  useMedicalRecordPrescriptions: () => mockUseMedicalRecordPrescriptions(),
  useCreatePrescription: () => mockUseCreatePrescription(),
  useUpdatePrescription: () => mockUseUpdatePrescription(),
  useDeletePrescription: () => mockUseDeletePrescription(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'actions.addPrescription': 'Add prescription',
        'actions.cancel': 'Cancel',
        'actions.delete': 'Delete',
        'actions.edit': 'Edit',
        'actions.print': 'Print',
        'actions.savePrescription': 'Save prescription',
        'actions.updatePrescription': 'Update prescription',
        'fields.dosage': 'Dosage',
        'fields.duration': 'Duration',
        'fields.instructions': 'Instructions',
        'fields.medicine': 'Medicine',
        'labels.noInstructions': 'No instructions added.',
        'prescriptions.createTitle': 'Add prescription',
        'prescriptions.description': 'Review prescriptions',
        'prescriptions.formDescription': 'Fill in prescription details.',
        'prescriptions.title': 'Linked prescriptions',
        'validation.required': 'This field is required.',
      };

      return labels[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
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
  return render(
    <PrescriptionPanel
      medicalRecordId="record-1"
      medicalRecord={{
        id: 'record-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        diagnosis: 'Seasonal flu',
        treatment: 'Rest and fluids',
        prescriptionsText: null,
        recordDate: '2026-05-01',
        patient: {
          id: 'patient-1',
          firstName: 'Lena',
          lastName: 'Morris',
        },
        doctor: {
          id: 'doctor-1',
          firstName: 'Ava',
          lastName: 'Taylor',
          specialization: 'General Medicine',
        },
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      }}
      canManage={canManage}
    />
  );
}

describe('PrescriptionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDownloadPrescriptionPdf.mockResolvedValue(undefined);

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
    await waitFor(() => {
      expect(mockDownloadPrescriptionPdf).toHaveBeenCalledWith(
        expect.objectContaining({
          prescriptions,
          medicalRecordId: 'record-1',
          medicalRecord: expect.objectContaining({
            diagnosis: 'Seasonal flu',
          }),
          patient: expect.objectContaining({
            firstName: 'Lena',
            lastName: 'Morris',
          }),
        }),
        { language: 'en' }
      );
    });

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
