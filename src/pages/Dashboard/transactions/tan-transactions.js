import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import { useTranslation } from 'react-i18next';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '@/domain/transactions/transactions.hooks';
const TransactionsPageRQ = () => {
    const { t } = useTranslation(['transactions', 'common']); // namespaces
    const { data, isLoading, refetch } = useTransactions(1, 20);
    const createTx = useCreateTransaction();
    const delTx = useDeleteTransaction();
    return (_jsxs("div", { className: "p-4 space-y-4 min-h-screen bg-white dark:bg-black text-tx-light dark:text-tx-dark", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: t('transactions:title') }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(LanguageSwitch, {}), _jsx(ThemeToggle, {})] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => refetch(), className: "px-3 py-1 border rounded", children: t('common:load') }), _jsx("button", { onClick: () => createTx.mutate({ userId: 'u1', amount: 100, currency: 'EUR' }), className: "px-3 py-1 border rounded", children: t('common:create') })] }), isLoading && _jsx("div", { children: t('common:loading') }), _jsx("ul", { children: data?.items?.map((tItem) => (_jsxs("li", { className: "flex justify-between border-b py-1", children: [_jsx("span", { children: t('transactions:currency', { amount: tItem.amount, currency: tItem.currency }) }), _jsx("button", { onClick: () => delTx.mutate(tItem.id), className: "px-2 py-0.5 border rounded", children: t('common:delete') })] }, tItem.id))) })] }));
};
export default TransactionsPageRQ;
