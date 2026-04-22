import { useTranslation } from 'react-i18next';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
} from '@/domain/transactions/transactions.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';

const TransactionsPageRQ = () => {
  const { t } = useTranslation(['transactions', 'common']);
  const { data, isLoading, refetch } = useTransactions(1, 20);
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();
  const hasItems = Boolean(data?.items?.length);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('transactions:title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('transactions:queryDescription')}</p>
        </div>
        <Badge>{t('transactions:badgeQuery')}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => refetch()} loading={isLoading}>
          {t('common:load')}
        </Button>
        <Button
          onClick={() => createTx.mutate({ userId: 'u1', amount: 100, currency: 'EUR' })}
          variant="secondary"
          loading={createTx.isPending}
        >
          {t('common:create')}
        </Button>
      </div>

      <Card
        title={t('transactions:listTitle')}
        description={t('transactions:listDescriptionQuery')}
      >
        {isLoading ? <p className="text-sm text-muted-foreground">{t('common:loading')}</p> : null}
        {!isLoading && !hasItems ? (
          <p className="text-sm text-muted-foreground">{t('transactions:empty')}</p>
        ) : null}

        {hasItems ? (
          <ul className="space-y-2">
            {data?.items.map((transactionItem) => (
              <li
                key={transactionItem.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface/70 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t('transactions:currency', {
                      amount: transactionItem.amount,
                      currency: transactionItem.currency,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('transactions:created')}: {new Date(transactionItem.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      transactionItem.status === 'completed'
                        ? 'success'
                        : transactionItem.status === 'failed'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {transactionItem.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={deleteTx.isPending}
                    onClick={() => deleteTx.mutate(transactionItem.id)}
                  >
                    {t('common:delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </section>
  );
};

export default TransactionsPageRQ;
