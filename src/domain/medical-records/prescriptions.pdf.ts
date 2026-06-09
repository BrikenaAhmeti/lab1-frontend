import type { Patient } from '@/domain/patients/patients.types';
import type { MedicalRecord, Prescription } from './medical-records.types';
import {
  formatMedicalRecordDate,
  formatMedicalRecordDateTime,
} from './medical-records.utils';

type PdfDocument = InstanceType<typeof import('jspdf').jsPDF>;
type Rgb = readonly [number, number, number];
type PersonLike = {
  firstName?: string | null;
  lastName?: string | null;
};

type HospitalDetails = {
  name?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
};

type PrescriptionPdfSource = {
  prescriptions: Prescription[];
  medicalRecord?: Partial<MedicalRecord> | null;
  medicalRecordId?: string;
  patient?: Partial<Patient> | Partial<MedicalRecord['patient']> | null;
};

type PrescriptionPdfOptions = {
  language?: string;
  logoUrl?: string;
  hospital?: HospitalDetails;
  generatedAt?: Date;
};

type Labels = {
  documentTitle: string;
  documentSubtitle: string;
  generated: string;
  patientDetails: string;
  recordDetails: string;
  patient: string;
  patientId: string;
  phone: string;
  address: string;
  doctor: string;
  specialization: string;
  recordId: string;
  recordDate: string;
  diagnosis: string;
  medicationPlan: string;
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
  noInstructions: string;
  noPrescriptions: string;
  authorization: string;
  signature: string;
  pharmacistNote: string;
  notAvailable: string;
  page: string;
};

const defaultLogoUrl = '/medsphere-logo.png';
const logoCache = new Map<string, Promise<string | null>>();
const pageWidth = 595;
const pageHeight = 842;
const pageMargin = 48;
const bottomLimit = 742;

const defaultHospital: Required<HospitalDetails> = {
  name: 'MedSphere Hospital',
  tagline: 'Connected clinical care and prescription services',
  address: 'Pristina clinical campus',
  phone: '+383 44 111 222',
  email: 'care@medsphere.app',
  website: 'medsphere.vercel.app',
};

const labels: Record<'en' | 'de', Labels> = {
  en: {
    documentTitle: 'PRESCRIPTION',
    documentSubtitle: 'Official medication order',
    generated: 'Generated',
    patientDetails: 'Patient details',
    recordDetails: 'Clinical record',
    patient: 'Patient',
    patientId: 'Patient ID',
    phone: 'Phone',
    address: 'Address',
    doctor: 'Doctor',
    specialization: 'Specialization',
    recordId: 'Record ID',
    recordDate: 'Record date',
    diagnosis: 'Diagnosis',
    medicationPlan: 'Medication plan',
    medicine: 'Medicine',
    dosage: 'Dosage',
    duration: 'Duration',
    instructions: 'Instructions',
    noInstructions: 'No additional instructions.',
    noPrescriptions: 'No prescriptions are listed for this medical record.',
    authorization: 'Authorization',
    signature: 'Doctor signature',
    pharmacistNote: 'Please verify allergies, dosage, and dispensing instructions before release.',
    notAvailable: 'Not available',
    page: 'Page',
  },
  de: {
    documentTitle: 'VERSCHREIBUNG',
    documentSubtitle: 'Offizielle Medikamentenanordnung',
    generated: 'Erstellt',
    patientDetails: 'Patientendaten',
    recordDetails: 'Klinischer Eintrag',
    patient: 'Patient',
    patientId: 'Patienten-ID',
    phone: 'Telefon',
    address: 'Adresse',
    doctor: 'Arzt',
    specialization: 'Fachrichtung',
    recordId: 'Eintrags-ID',
    recordDate: 'Eintragsdatum',
    diagnosis: 'Diagnose',
    medicationPlan: 'Medikationsplan',
    medicine: 'Medikament',
    dosage: 'Dosierung',
    duration: 'Dauer',
    instructions: 'Anweisungen',
    noInstructions: 'Keine weiteren Anweisungen.',
    noPrescriptions: 'Fuer diesen klinischen Eintrag sind keine Verschreibungen hinterlegt.',
    authorization: 'Autorisierung',
    signature: 'Arztunterschrift',
    pharmacistNote: 'Bitte Allergien, Dosierung und Abgabehinweise vor der Ausgabe pruefen.',
    notAvailable: 'Nicht verfuegbar',
    page: 'Seite',
  },
};

function getLabels(language: string) {
  return language.toLowerCase().startsWith('de') ? labels.de : labels.en;
}

function stringify(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function sanitizeFilename(value: string) {
  const normalized = value.trim().replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '');
  return normalized || 'prescription';
}

function getPersonName(person?: PersonLike | null) {
  return [person?.firstName, person?.lastName]
    .map((part) => stringify(part))
    .filter(Boolean)
    .join(' ')
    .trim();
}

function getOptionalField(source: unknown, key: string) {
  if (typeof source !== 'object' || source === null || !(key in source)) {
    return '';
  }

  return stringify((source as Record<string, unknown>)[key]);
}

function splitText(doc: PdfDocument, value: string, width: number) {
  return doc.splitTextToSize(value, width) as string[];
}

async function readLogoDataUrl(logoUrl: string) {
  if (!logoCache.has(logoUrl)) {
    logoCache.set(
      logoUrl,
      fetch(logoUrl)
        .then((response) => (response.ok ? response.blob() : null))
        .then((blob) => {
          if (!blob) {
            return null;
          }

          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
        })
        .catch(() => null)
    );
  }

  return logoCache.get(logoUrl) ?? null;
}

function setFill(doc: PdfDocument, color: Rgb) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setText(doc: PdfDocument, color: Rgb) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function drawRoundedRect(
  doc: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Rgb,
  radius = 14
) {
  setFill(doc, color);
  doc.roundedRect(x, y, width, height, radius, radius, 'F');
}

function drawPageBackground(doc: PdfDocument) {
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, pageWidth, 7, 'F');
}

function drawLogo(doc: PdfDocument, logoDataUrl: string | null, x: number, y: number) {
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', x, y, 62, 35);
    return;
  }

  drawRoundedRect(doc, x, y, 46, 46, [14, 165, 233], 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('M', x + 17, y + 29);
}

function drawDocumentHeader(
  doc: PdfDocument,
  hospital: Required<HospitalDetails>,
  text: Labels,
  logoDataUrl: string | null,
  generatedAt: Date,
  language: string,
  compact = false
) {
  drawRoundedRect(doc, 32, 32, 531, compact ? 104 : 140, [255, 255, 255], 18);
  drawLogo(doc, logoDataUrl, 48, 52);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setText(doc, [15, 23, 42]);
  doc.text(hospital.name, 126, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setText(doc, [100, 116, 139]);
  doc.text(hospital.tagline, 126, 76);
  doc.text(hospital.address, 126, 91);
  doc.text(`${hospital.phone} | ${hospital.email} | ${hospital.website}`, 126, 106);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(compact ? 20 : 24);
  setText(doc, [15, 23, 42]);
  doc.text(compact ? `${text.documentTitle} - CONT.` : text.documentTitle, 395, 61);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, [100, 116, 139]);
  doc.text(text.documentSubtitle, 395, 80);
  doc.text(
    `${text.generated}: ${formatMedicalRecordDateTime(generatedAt.toISOString(), language)}`,
    395,
    97
  );

  if (!compact) {
    drawRoundedRect(doc, 395, 116, 56, 34, [224, 242, 254], 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    setText(doc, [2, 132, 199]);
    doc.text('Rx', 412, 139);
  }
}

function drawSectionTitle(doc: PdfDocument, title: string, x: number, y: number, width = 200) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(doc, [15, 23, 42]);
  doc.text(title.toUpperCase(), x, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(x, y + 8, x + width, y + 8);
}

function drawRows(
  doc: PdfDocument,
  rows: Array<{ label: string; value: string }>,
  x: number,
  y: number,
  width: number
) {
  let cursor = y;

  rows.forEach((row) => {
    if (!row.value) {
      return;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(doc, [100, 116, 139]);
    doc.text(row.label, x, cursor);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    setText(doc, [15, 23, 42]);
    const lines = splitText(doc, row.value, width);
    doc.text(lines, x, cursor + 12);
    cursor += 16 + lines.length * 10;
  });

  return cursor;
}

function drawInfoCard(
  doc: PdfDocument,
  title: string,
  rows: Array<{ label: string; value: string }>,
  x: number,
  y: number
) {
  drawRoundedRect(doc, x, y, 242, 146, [255, 255, 255], 16);
  drawSectionTitle(doc, title, x + 18, y + 28);
  drawRows(doc, rows, x + 18, y + 54, 194);
}

function drawMedicationHeader(doc: PdfDocument, text: Labels, y: number) {
  drawRoundedRect(doc, pageMargin, y, 499, 42, [14, 165, 233], 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(text.medicationPlan.toUpperCase(), pageMargin + 18, y + 27);
}

function drawEmptyPrescriptionState(doc: PdfDocument, text: Labels, y: number) {
  drawRoundedRect(doc, pageMargin, y, 499, 76, [255, 255, 255], 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setText(doc, [71, 85, 105]);
  doc.text(text.noPrescriptions, pageMargin + 18, y + 42);
}

function drawMedicationRow(
  doc: PdfDocument,
  prescription: Prescription,
  index: number,
  text: Labels,
  y: number
) {
  const medicine = prescription.medicine || text.notAvailable;
  const instructions = prescription.instructions?.trim() || text.noInstructions;
  const instructionLines = splitText(doc, instructions, 427);
  const medicineLines = splitText(doc, medicine, 235);
  const rowHeight = Math.max(92, 66 + instructionLines.length * 10 + medicineLines.length * 10);

  drawRoundedRect(doc, pageMargin, y, 499, rowHeight, [255, 255, 255], 14);
  drawRoundedRect(doc, pageMargin + 18, y + 18, 28, 28, [224, 242, 254], 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(doc, [2, 132, 199]);
  doc.text(String(index + 1), pageMargin + 32, y + 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(doc, [100, 116, 139]);
  doc.text(text.medicine.toUpperCase(), pageMargin + 62, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText(doc, [15, 23, 42]);
  doc.text(medicineLines, pageMargin + 62, y + 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(doc, [100, 116, 139]);
  doc.text(text.dosage.toUpperCase(), pageMargin + 330, y + 22);
  doc.text(text.duration.toUpperCase(), pageMargin + 424, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  setText(doc, [15, 23, 42]);
  doc.text(splitText(doc, prescription.dosage || text.notAvailable, 76), pageMargin + 330, y + 38);
  doc.text(splitText(doc, prescription.duration || text.notAvailable, 76), pageMargin + 424, y + 38);

  doc.setDrawColor(226, 232, 240);
  doc.line(pageMargin + 62, y + 60, pageMargin + 481, y + 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(doc, [100, 116, 139]);
  doc.text(text.instructions.toUpperCase(), pageMargin + 62, y + 78);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setText(doc, [51, 65, 85]);
  doc.text(instructionLines, pageMargin + 62, y + 94);

  return rowHeight;
}

function drawAuthorization(
  doc: PdfDocument,
  text: Labels,
  doctorName: string,
  specialization: string,
  y: number
) {
  drawRoundedRect(doc, pageMargin, y, 499, 112, [255, 255, 255], 16);
  drawSectionTitle(doc, text.authorization, pageMargin + 18, y + 28, 180);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, [100, 116, 139]);
  doc.text(text.doctor, pageMargin + 18, y + 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(doc, [15, 23, 42]);
  doc.text(doctorName, pageMargin + 18, y + 72);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setText(doc, [71, 85, 105]);
  doc.text(specialization, pageMargin + 18, y + 88);

  doc.setDrawColor(148, 163, 184);
  doc.line(pageMargin + 320, y + 72, pageMargin + 480, y + 72);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, [100, 116, 139]);
  doc.text(text.signature, pageMargin + 355, y + 88);
}

function drawFooter(
  doc: PdfDocument,
  text: Labels,
  hospital: Required<HospitalDetails>,
  pageNumber: number,
  totalPages: number
) {
  doc.setDrawColor(226, 232, 240);
  doc.line(pageMargin, 786, 547, 786);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, [100, 116, 139]);
  doc.text(text.pharmacistNote, pageMargin, 806);
  doc.text(`${hospital.website} | ${text.page} ${pageNumber}/${totalPages}`, 547, 806, {
    align: 'right',
  });
}

function addContinuationPage(
  doc: PdfDocument,
  hospital: Required<HospitalDetails>,
  text: Labels,
  logoDataUrl: string | null,
  generatedAt: Date,
  language: string
) {
  doc.addPage();
  drawPageBackground(doc);
  drawDocumentHeader(doc, hospital, text, logoDataUrl, generatedAt, language, true);
  drawMedicationHeader(doc, text, 164);
  return 226;
}

export async function downloadPrescriptionPdf(
  source: PrescriptionPdfSource,
  options: PrescriptionPdfOptions = {}
) {
  const { jsPDF } = await import('jspdf');
  const language = options.language ?? 'en';
  const text = getLabels(language);
  const hospital = { ...defaultHospital, ...options.hospital };
  const generatedAt = options.generatedAt ?? new Date();
  const medicalRecord = source.medicalRecord ?? null;
  const prescriptions = source.prescriptions;
  const patient = source.patient ?? medicalRecord?.patient ?? null;
  const doctor = medicalRecord?.doctor ?? null;
  const patientName = getPersonName(patient) || text.notAvailable;
  const patientId = stringify(patient?.id) || stringify(medicalRecord?.patientId);
  const patientPhone = getOptionalField(patient, 'phoneNumber');
  const patientAddress = getOptionalField(patient, 'address');
  const doctorName = getPersonName(doctor) || text.notAvailable;
  const specialization = stringify(doctor?.specialization) || text.notAvailable;
  const recordId =
    stringify(medicalRecord?.id)
    || stringify(source.medicalRecordId)
    || stringify(prescriptions[0]?.medicalRecordId)
    || 'record';
  const recordDate = stringify(medicalRecord?.recordDate);
  const diagnosis = stringify(medicalRecord?.diagnosis) || text.notAvailable;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const logoDataUrl = await readLogoDataUrl(options.logoUrl ?? defaultLogoUrl);

  drawPageBackground(doc);
  drawDocumentHeader(doc, hospital, text, logoDataUrl, generatedAt, language);
  drawInfoCard(
    doc,
    text.patientDetails,
    [
      { label: text.patient, value: patientName },
      { label: text.patientId, value: patientId || text.notAvailable },
      { label: text.phone, value: patientPhone },
      { label: text.address, value: patientAddress },
    ],
    pageMargin,
    202
  );
  drawInfoCard(
    doc,
    text.recordDetails,
    [
      { label: text.recordId, value: recordId },
      {
        label: text.recordDate,
        value: recordDate ? formatMedicalRecordDate(recordDate, language) : text.notAvailable,
      },
      { label: text.doctor, value: doctorName },
      { label: text.specialization, value: specialization },
      { label: text.diagnosis, value: diagnosis },
    ],
    305,
    202
  );

  drawMedicationHeader(doc, text, 378);
  let cursor = 440;

  if (!prescriptions.length) {
    drawEmptyPrescriptionState(doc, text, cursor);
    cursor += 96;
  } else {
    prescriptions.forEach((prescription, index) => {
      const instructionLines = splitText(
        doc,
        prescription.instructions?.trim() || text.noInstructions,
        427
      );
      const medicineLines = splitText(doc, prescription.medicine || text.notAvailable, 235);
      const nextHeight = Math.max(92, 66 + instructionLines.length * 10 + medicineLines.length * 10);

      if (cursor + nextHeight > bottomLimit) {
        cursor = addContinuationPage(doc, hospital, text, logoDataUrl, generatedAt, language);
      }

      const rowHeight = drawMedicationRow(doc, prescription, index, text, cursor);
      cursor += rowHeight + 12;
    });
  }

  if (cursor + 126 > bottomLimit) {
    cursor = addContinuationPage(doc, hospital, text, logoDataUrl, generatedAt, language);
  }

  drawAuthorization(doc, text, doctorName, specialization, cursor + 8);

  const totalPages = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    drawFooter(doc, text, hospital, pageNumber, totalPages);
  }

  doc.save(`${sanitizeFilename(`prescription-${recordId}-${patientName}`)}.pdf`);
}
