import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
} from '@/domain/transactions/transactions.slice';
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

  const remove = async (id: string) => {
    await dispatch(deleteTransaction(id)).unwrap();
  };

  const hasItems = Boolean(page?.items.length);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Redux Toolkit flow for loading, creating, and deleting transactions.
          </p>
        </div>
        <Badge variant="secondary">RTK State</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={load} loading={loading}>
          Load Transactions
        </Button>
        <Button onClick={add} variant="secondary" disabled={loading}>
          Create Demo Transaction
        </Button>
      </div>

      <Card
        title="Transaction List"
        description="Data source: transactions slice in Redux store."
      >
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {!error && !hasItems ? (
          <p className="text-sm text-muted-foreground">No transactions loaded yet.</p>
        ) : null}

        {hasItems ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Currency</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {page?.items.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-border/70">
                    <td className="px-3 py-2 font-medium text-foreground">{transaction.id}</td>
                    <td className="px-3 py-2 text-muted-foreground">{transaction.amount}</td>
                    <td className="px-3 py-2 text-muted-foreground">{transaction.currency}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'success'
                            : transaction.status === 'failed'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        onClick={() => remove(transaction.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </section>
  );
};

export default TransactionsPageRTK;
