import { Navigate, Route, Routes } from 'react-router-dom';
import RouteGuard from '@/app/routing/RouteGuard';
import MedicalRecordsListPage from '@/pages/Dashboard/medical-records';
import MedicalRecordFormPage from '@/pages/Dashboard/medical-records/form';

export default function MedicalRecordsRoutePage() {
  return (
    <RouteGuard module="medicalRecords" action="VIEW">
      <Routes>
        <Route index element={<MedicalRecordsListPage />} />
        <Route path="new" element={<MedicalRecordFormPage />} />
        <Route path=":id/edit" element={<MedicalRecordFormPage />} />
        <Route path="*" element={<Navigate to="/medical-records" replace />} />
      </Routes>
    </RouteGuard>
  );
}
