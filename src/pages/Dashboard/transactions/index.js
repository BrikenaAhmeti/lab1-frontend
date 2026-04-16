import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createTransaction, deleteTransaction, fetchTransactions, } from '@/domain/transactions/transactions.slice';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
const TransactionsPageRTK = () => {
    const dispatch = useAppDispatch();
    const page = useAppSelector((s) => s.transactions.page);
    const loading = useAppSelector((s) => s.transactions.loading);
    const error = useAppSelector((s) => s.transactions.error);
    const load = async () => {
        await dispatch(fetchTransactions({ page: 1, pageSize: 10 })).unwrap();
    };
    const add = async () => {
        await dispatch(createTransaction({ userId: 'u1', amount: 100, currency: 'EUR' })).unwrap();
    };
    const remove = async (id) => {
        await dispatch(deleteTransaction(id)).unwrap();
    };
    const hasItems = Boolean(page?.items.length);
    return (_jsxs("section", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Transactions" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Redux Toolkit flow for loading, creating, and deleting transactions." })] }), _jsx(Badge, { variant: "secondary", children: "RTK State" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { onClick: load, loading: loading, children: "Load Transactions" }), _jsx(Button, { onClick: add, variant: "secondary", disabled: loading, children: "Create Demo Transaction" })] }), _jsxs(Card, { title: "Transaction List", description: "Data source: transactions slice in Redux store.", children: [error ? _jsx("p", { className: "text-sm text-danger", children: error }) : null, !error && !hasItems ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No transactions loaded yet." })) : null, hasItems ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2", children: "ID" }), _jsx("th", { className: "px-3 py-2", children: "Amount" }), _jsx("th", { className: "px-3 py-2", children: "Currency" }), _jsx("th", { className: "px-3 py-2", children: "Status" }), _jsx("th", { className: "px-3 py-2 text-right", children: "Actions" })] }) }), _jsx("tbody", { children: page?.items.map((transaction) => (_jsxs("tr", { className: "border-t border-border/70", children: [_jsx("td", { className: "px-3 py-2 font-medium text-foreground", children: transaction.id }), _jsx("td", { className: "px-3 py-2 text-muted-foreground", children: transaction.amount }), _jsx("td", { className: "px-3 py-2 text-muted-foreground", children: transaction.currency }), _jsx("td", { className: "px-3 py-2", children: _jsx(Badge, { variant: transaction.status === 'completed'
                                                        ? 'success'
                                                        : transaction.status === 'failed'
                                                            ? 'danger'
                                                            : 'warning', children: transaction.status }) }), _jsx("td", { className: "px-3 py-2 text-right", children: _jsx(Button, { size: "sm", variant: "outline", disabled: loading, onClick: () => remove(transaction.id), children: "Delete" }) })] }, transaction.id))) })] }) })) : null] })] }));
};
export default TransactionsPageRTK;
