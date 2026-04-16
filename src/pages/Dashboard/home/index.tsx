import { formatMoney } from '@/config/currencies';
import { useUsers } from '@/hooks/useUsers';
import Badge from '@/ui/atoms/Badge';
import Card from '@/ui/atoms/Card';

type DashboardMetric = {
  title: string;
  value: string;
  change: string;
};

const metrics: DashboardMetric[] = [
  {
    title: 'Daily Appointments',
    value: '34',
    change: '+8% vs yesterday',
  },
  {
    title: 'Available Rooms',
    value: '18',
    change: '12 ICU, 6 General',
  },
  {
    title: 'Admitted Patients',
    value: '76',
    change: '+4 active admissions',
  },
];

const Home = () => {
  const { data, isLoading, error } = useUsers();
  const users = Array.isArray(data)
    ? (data as Array<{ id: string | number; name?: string }>)
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Hospital Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor appointments, room utilization, admissions, and operational flow.
          </p>
        </div>
        <Badge variant="secondary" className="mt-1">
          Daily Operations
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title} className="h-full">
            <p className="text-sm text-muted-foreground">{metric.title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-1 text-xs font-medium text-primary">{metric.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Revenue Snapshot" description="Billing activity aligned with today's admissions.">
          <p className="text-3xl font-bold text-foreground">{formatMoney(12345.67)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Invoices and patient admissions are synchronized.</p>
        </Card>

        <Card
          title="Staff Directory Snapshot"
          description="Pulled from your users endpoint through TanStack Query."
        >
          {isLoading ? <p className="text-sm text-muted-foreground">Loading users...</p> : null}
          {error ? <p className="text-sm text-danger">Unable to load users right now.</p> : null}
          {!isLoading && !error && users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found yet.</p>
          ) : null}
          {!isLoading && !error && users.length > 0 ? (
            <ul className="space-y-2">
              {users.slice(0, 8).map((userItem) => (
                <li
                  key={userItem.id}
                  className="rounded-lg border border-border/70 bg-surface/70 px-3 py-2 text-sm"
                >
                  {userItem.name || 'Unnamed user'}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>
    </section>
  );
};

export default Home;
