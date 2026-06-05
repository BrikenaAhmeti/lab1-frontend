import type { Invoice } from './invoices.types';
import {
  formatInvoiceDate,
  getInvoicePatientName,
  normalizeInvoiceStatus,
} from './invoices.utils';
import { formatCurrency } from '@/utils/formatters/currency';

type InvoicePdfSource = Invoice | Record<string, unknown>;

type InvoicePdfOptions = {
  language?: string;
  locale?: string;
  currency?: string;
  logoUrl?: string;
};

type DetailRow = {
  label: string;
  value: string;
};

type PdfDocument = InstanceType<typeof import('jspdf').jsPDF>;

const defaultLogoUrl = '/medsphere-logo.png';
const knownInvoiceKeys = new Set([
  'id',
  'patientId',
  'patient_id',
  'appointmentId',
  'appointment_id',
  'admissionId',
  'admission_id',
  'amount',
  'invoiceDate',
  'invoice_date',
  'date',
  'status',
  'description',
  'patient',
  'createdAt',
  'created_at',
  'updatedAt',
  'updated_at',
]);

const logoCache = new Map<string, Promise<string | null>>();

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function getValue(source: InvoicePdfSource, ...keys: string[]) {
  const record = getRecord(source);

  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function getNestedValue(source: unknown, ...keys: string[]) {
  const record = getRecord(source);

  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function stringifyValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function labelizeKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (value) => value.toUpperCase());
}

function sanitizeFilename(value: string) {
  const normalized = value.trim().replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '');
  return normalized || 'invoice';
}

function getInvoiceId(invoice: InvoicePdfSource) {
  return stringifyValue(getValue(invoice, 'id')) || 'invoice';
}

function getInvoiceDate(invoice: InvoicePdfSource) {
  return stringifyValue(getValue(invoice, 'invoiceDate', 'invoice_date', 'date'));
}

function getPatientDetails(invoice: InvoicePdfSource) {
  const patient = getValue(invoice, 'patient');
  const patientRecord = getRecord(patient);
  const patientName = patientRecord
    ? getInvoicePatientName(patientRecord)
      || stringifyValue(getNestedValue(patientRecord, 'fullName', 'name'))
    : '';

  return {
    name: patientName || 'Not available',
    id: stringifyValue(getValue(invoice, 'patientId', 'patient_id'))
      || stringifyValue(getNestedValue(patientRecord, 'id')),
    phone: stringifyValue(getNestedValue(patientRecord, 'phoneNumber', 'phone', 'phone_number')),
    email: stringifyValue(getNestedValue(patientRecord, 'email')),
  };
}

function getAmount(invoice: InvoicePdfSource) {
  const amount = Number(getValue(invoice, 'amount'));
  return Number.isFinite(amount) ? amount : 0;
}

function getStatusMeta(status: string) {
  const normalized = normalizeInvoiceStatus(status);

  if (normalized === 'PAID') {
    return { label: 'Paid', fill: [220, 252, 231] as const, text: [22, 101, 52] as const };
  }

  if (normalized === 'CANCELLED') {
    return { label: 'Cancelled', fill: [254, 226, 226] as const, text: [153, 27, 27] as const };
  }

  return { label: normalized === 'PENDING' ? 'Pending' : status || 'Pending', fill: [254, 243, 199] as const, text: [146, 64, 14] as const };
}

function collectAdditionalDetails(invoice: InvoicePdfSource) {
  const record = getRecord(invoice);

  if (!record) {
    return [];
  }

  return Object.entries(record)
    .filter(([key, value]) => !knownInvoiceKeys.has(key) && stringifyValue(value))
    .map(([key, value]) => ({
      label: labelizeKey(key),
      value: stringifyValue(value),
    }));
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

function drawRoundedRect(
  doc: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  color: readonly [number, number, number],
  radius = 10
) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, width, height, radius, radius, 'F');
}

function drawSectionTitle(doc: PdfDocument, title: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), x, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(x, y + 8, x + 220, y + 8);
}

function drawRows(doc: PdfDocument, rows: DetailRow[], x: number, y: number, width: number) {
  let cursor = y;

  rows.forEach((row) => {
    if (!row.value) {
      return;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(row.label, x, cursor);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(row.value, width);
    doc.text(lines, x, cursor + 13);
    cursor += 16 + lines.length * 10;
  });

  return cursor;
}

function drawFooter(doc: PdfDocument) {
  doc.setDrawColor(226, 232, 240);
  doc.line(48, 785, 547, 785);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('MedSphere billing document generated for clinic records.', 48, 805);
  doc.text('Thank you for trusting MedSphere.', 430, 805);
}

export async function downloadInvoicePdf(invoice: InvoicePdfSource, options: InvoicePdfOptions = {}) {
  const { jsPDF } = await import('jspdf');
  const language = options.language ?? 'en';
  const locale = options.locale ?? (language === 'de' ? 'de-DE' : 'en-US');
  const currency = options.currency ?? 'EUR';
  const invoiceId = getInvoiceId(invoice);
  const invoiceDate = getInvoiceDate(invoice);
  const createdAt = stringifyValue(getValue(invoice, 'createdAt', 'created_at'));
  const updatedAt = stringifyValue(getValue(invoice, 'updatedAt', 'updated_at'));
  const description = stringifyValue(getValue(invoice, 'description'));
  const status = stringifyValue(getValue(invoice, 'status'));
  const statusMeta = getStatusMeta(status);
  const amount = getAmount(invoice);
  const patient = getPatientDetails(invoice);
  const appointmentId = stringifyValue(getValue(invoice, 'appointmentId', 'appointment_id'));
  const admissionId = stringifyValue(getValue(invoice, 'admissionId', 'admission_id'));
  const additionalDetails = collectAdditionalDetails(invoice);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const logoDataUrl = await readLogoDataUrl(options.logoUrl ?? defaultLogoUrl);

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 595, 842, 'F');
  drawRoundedRect(doc, 32, 32, 531, 140, [255, 255, 255], 18);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 48, 49, 46, 46);
  } else {
    drawRoundedRect(doc, 48, 49, 46, 46, [14, 165, 233], 10);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('MedSphere', 108, 65);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Clinical billing and patient care records', 108, 82);
  doc.text('medsphere.vercel.app', 108, 97);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', 442, 64);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`#${invoiceId}`, 442, 82);

  drawRoundedRect(doc, 442, 99, 96, 24, statusMeta.fill, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(statusMeta.text[0], statusMeta.text[1], statusMeta.text[2]);
  doc.text(statusMeta.label, 458, 115);

  drawRoundedRect(doc, 48, 190, 242, 150, [255, 255, 255], 16);
  drawRoundedRect(doc, 305, 190, 242, 150, [255, 255, 255], 16);
  drawSectionTitle(doc, 'Bill to', 66, 218);
  drawRows(
    doc,
    [
      { label: 'Patient', value: patient.name },
      { label: 'Patient ID', value: patient.id },
      { label: 'Phone', value: patient.phone },
      { label: 'Email', value: patient.email },
    ],
    66,
    242,
    190
  );

  drawSectionTitle(doc, 'Invoice details', 323, 218);
  drawRows(
    doc,
    [
      {
        label: 'Invoice date',
        value: invoiceDate ? formatInvoiceDate(invoiceDate, language) : 'Not available',
      },
      { label: 'Appointment ID', value: appointmentId },
      { label: 'Admission ID', value: admissionId },
      {
        label: 'Created',
        value: createdAt ? formatInvoiceDate(createdAt, language) : '',
      },
      {
        label: 'Updated',
        value: updatedAt ? formatInvoiceDate(updatedAt, language) : '',
      },
    ],
    323,
    242,
    190
  );

  drawRoundedRect(doc, 48, 364, 499, 186, [255, 255, 255], 16);
  drawSectionTitle(doc, 'Care and billing summary', 66, 394);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(66, 414, 463, 32, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Description', 82, 434);
  doc.text('Amount', 462, 434);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const descriptionLines = doc.splitTextToSize(description || 'Invoice services', 330);
  doc.text(descriptionLines, 82, 468);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(amount, currency, locale), 462, 468, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(66, 498, 529, 498);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Total', 360, 524);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(amount, currency, locale), 529, 524, { align: 'right' });

  if (additionalDetails.length) {
    drawRoundedRect(doc, 48, 574, 499, 120, [255, 255, 255], 16);
    drawSectionTitle(doc, 'Additional details', 66, 604);
    drawRows(doc, additionalDetails.slice(0, 6), 66, 628, 430);
  }

  drawFooter(doc);
  doc.save(`${sanitizeFilename(`invoice-${invoiceId}`)}.pdf`);
}
