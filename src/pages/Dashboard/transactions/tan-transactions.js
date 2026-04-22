import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useCreateTransaction, useDeleteTransaction, useTransactions, } from '@/domain/transactions/transactions.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
const TransactionsPageRQ = () => {
    const { t } = useTranslation(['transactions', 'common']);
    const { data, isLoading, refetch } = useTransactions(1, 20);
    const createTx = useCreateTransaction();
    const deleteTx = useDeleteTransaction();
    const hasItems = Boolean(data?.items?.length);
    return (_jsxs("section", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground", children: t('transactions:title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('transactions:queryDescription') })] }), _jsx(Badge, { children: t('transactions:badgeQuery') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { onClick: () => refetch(), loading: isLoading, children: t('common:load') }), _jsx(Button, { onClick: () => createTx.mutate({ userId: 'u1', amount: 100, currency: 'EUR' }), variant: "secondary", loading: createTx.isPending, children: t('common:create') })] }), _jsxs(Card, { title: t('transactions:listTitle'), description: t('transactions:listDescriptionQuery'), children: [isLoading ? _jsx("p", { className: "text-sm text-muted-foreground", children: t('common:loading') }) : null, !isLoading && !hasItems ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('transactions:empty') })) : null, hasItems ? (_jsx("ul", { className: "space-y-2", children: data?.items.map((transactionItem) => (_jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface/70 px-3 py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('transactions:currency', {
                                                amount: transactionItem.amount,
                                                currency: transactionItem.currency,
                                            }) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [t('transactions:created'), ": ", new Date(transactionItem.createdAt).toLocaleString()] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: transactionItem.status === 'completed'
                                                ? 'success'
                                                : transactionItem.status === 'failed'
                                                    ? 'danger'
                                                    : 'warning', children: transactionItem.status }), _jsx(Button, { size: "sm", variant: "outline", loading: deleteTx.isPending, onClick: () => deleteTx.mutate(transactionItem.id), children: t('common:delete') })] })] }, transactionItem.id))) })) : null] })] }));
};
export default TransactionsPageRQ;
