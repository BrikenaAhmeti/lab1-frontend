import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchTransactions, createTransaction, deleteTransaction } from '@/domain/transactions/transactions.slice';
const TransactionsPageRTK = () => {
    const dispatch = useAppDispatch();
    const page = useAppSelector(s => s.transactions.page);
    const loading = useAppSelector(s => s.transactions.loading);
    const load = async () => { await dispatch(fetchTransactions({ page: 1, pageSize: 10 })).unwrap(); };
    const add = async () => { await dispatch(createTransaction({ userId: 'u1', amount: 100, currency: 'EUR' })).unwrap(); };
    const remove = async (id) => { await dispatch(deleteTransaction(id)).unwrap(); };
    return (_jsxs("div", { className: "p-4 space-y-2", children: [_jsx("button", { onClick: load, children: "Load" }), _jsx("button", { onClick: add, children: "Create" }), loading && _jsx("div", { children: "Loading\u2026" }), _jsx("ul", { children: page?.items.map(t => (_jsxs("li", { children: [t.id, " \u2014 ", t.amount, " ", t.currency, _jsx("button", { onClick: () => remove(t.id), children: "Delete" })] }, t.id))) })] }));
};
export default TransactionsPageRTK;
