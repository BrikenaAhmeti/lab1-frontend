import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { formatInvoiceDate, getInvoicePatientName, getInvoiceStatusVariant, isKnownInvoiceStatus, normalizeInvoiceStatus, } from '@/domain/invoices/invoices.utils';
import { formatCurrency } from '@/utils/formatters/currency';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
export default function InvoiceTable({ invoices, canManage, payingId, cancellingId, onPay, onCancel, }) {
    const { t, i18n } = useTranslation('invoices');
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-[760px] w-full text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2", children: t('table.id') }), _jsx("th", { className: "px-3 py-2", children: t('table.patient') }), _jsx("th", { className: "px-3 py-2", children: t('table.amount') }), _jsx("th", { className: "px-3 py-2", children: t('table.date') }), _jsx("th", { className: "px-3 py-2", children: t('table.status') }), _jsx("th", { className: "px-3 py-2 text-right", children: t('table.actions') })] }) }), _jsx("tbody", { children: invoices.map((invoice) => {
                        const status = normalizeInvoiceStatus(invoice.status);
                        const patientName = getInvoicePatientName(invoice.patient) || t('labels.notAvailable');
                        const canManageRow = canManage && status === 'PENDING';
                        return (_jsxs("tr", { className: "border-t border-border/70", children: [_jsx("td", { className: "px-3 py-3 font-medium text-foreground", children: invoice.id }), _jsx("td", { className: "px-3 py-3 text-foreground", children: patientName }), _jsx("td", { className: "px-3 py-3 text-muted-foreground", children: formatCurrency(invoice.amount, 'EUR', locale) }), _jsx("td", { className: "px-3 py-3 text-muted-foreground", children: formatInvoiceDate(invoice.invoiceDate, i18n.language) }), _jsx("td", { className: "px-3 py-3", children: _jsx(Badge, { variant: getInvoiceStatusVariant(invoice.status), children: isKnownInvoiceStatus(status) ? t(`statuses.${status}`) : invoice.status }) }), _jsx("td", { className: "px-3 py-3", children: canManageRow ? (_jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { size: "sm", variant: "secondary", loading: payingId === invoice.id, disabled: cancellingId === invoice.id, onClick: () => onPay(invoice), children: t('actions.markPaid') }), _jsx(Button, { size: "sm", variant: "danger", loading: cancellingId === invoice.id, disabled: payingId === invoice.id, onClick: () => onCancel(invoice), children: t('actions.cancel') })] })) : (_jsx("div", { className: "text-right text-xs text-muted-foreground", children: canManage ? t('table.noActions') : t('labels.viewOnly') })) })] }, invoice.id));
                    }) })] }) }));
}
