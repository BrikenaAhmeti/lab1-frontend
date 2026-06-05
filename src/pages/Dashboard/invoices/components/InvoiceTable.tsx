import { useTranslation } from 'react-i18next';
import type { Invoice } from '@/domain/invoices/invoices.types';
import {
  formatInvoiceDate,
  getInvoicePatientName,
  getInvoiceStatusVariant,
  isKnownInvoiceStatus,
  normalizeInvoiceStatus,
} from '@/domain/invoices/invoices.utils';
import { formatCurrency } from '@/utils/formatters/currency';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';

type InvoiceTableProps = {
  invoices: Invoice[];
  canManage: boolean;
  payingId?: string;
  cancellingId?: string;
  downloadingPdfId?: string;
  onPay: (invoice: Invoice) => void;
  onCancel: (invoice: Invoice) => void;
  onDownloadPdf: (invoice: Invoice) => void;
};

export default function InvoiceTable({
  invoices,
  canManage,
  payingId,
  cancellingId,
  downloadingPdfId,
  onPay,
  onCancel,
  onDownloadPdf,
}: InvoiceTableProps) {
  const { t, i18n } = useTranslation('invoices');
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">{t('table.id')}</th>
            <th className="px-3 py-2">{t('table.patient')}</th>
            <th className="px-3 py-2">{t('table.amount')}</th>
            <th className="px-3 py-2">{t('table.date')}</th>
            <th className="px-3 py-2">{t('table.status')}</th>
            <th className="px-3 py-2 text-right">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const status = normalizeInvoiceStatus(invoice.status);
            const patientName = getInvoicePatientName(invoice.patient) || t('labels.notAvailable');
            const canManageRow = canManage && status === 'PENDING';

            return (
              <tr key={invoice.id} className="border-t border-border/70">
                <td className="px-3 py-3 font-medium text-foreground">{invoice.id}</td>
                <td className="px-3 py-3 text-foreground">{patientName}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatCurrency(invoice.amount, 'EUR', locale)}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatInvoiceDate(invoice.invoiceDate, i18n.language)}
                </td>
                <td className="px-3 py-3">
                  <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                    {isKnownInvoiceStatus(status) ? t(`statuses.${status}`) : invoice.status}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={downloadingPdfId === invoice.id}
                      disabled={payingId === invoice.id || cancellingId === invoice.id}
                      onClick={() => onDownloadPdf(invoice)}
                    >
                      {t('actions.downloadPdf')}
                    </Button>
                    {canManageRow ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={payingId === invoice.id}
                          disabled={cancellingId === invoice.id}
                          onClick={() => onPay(invoice)}
                        >
                          {t('actions.markPaid')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={cancellingId === invoice.id}
                          disabled={payingId === invoice.id}
                          onClick={() => onCancel(invoice)}
                        >
                          {t('actions.cancel')}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
