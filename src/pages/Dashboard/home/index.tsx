import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  formatAdmissionDate,
  getAdmissionApiMessage,
  getAdmissionDateValue,
  getAdmissionPatientName,
  getAdmissionRoomLabel,
  getAdmissionStatusVariant,
  isKnownAdmissionStatus,
  normalizeAdmissionStatus,
} from '@/domain/admissions/admissions.utils';
import {
  useDashboardActiveAdmissions,
  useDashboardStats,
  useDashboardTodayAppointments,
} from '@/domain/dashboard/dashboard.hooks';
import {
  formatAppointmentDate,
  getAppointmentApiMessage,
  getAppointmentDoctorName,
  getAppointmentPatientName,
  getAppointmentStatusVariant,
  getTodayDateValue,
} from '@/domain/appointments/appointments.utils';
import { formatCurrency } from '@/utils/formatters/currency';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';

type SummaryCardProps = {
  title: string;
  value: string;
};

function SummaryCard({ title, value }: SummaryCardProps) {
  return (
    <Card title={title} className="h-full">
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </Card>
  );
}

function getLocale(language: string) {
  return language === 'de' ? 'de-DE' : 'en-US';
}

function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function getDaysAdmitted(value: string | undefined) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const difference = Date.now() - date.getTime();
  return String(Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))));
}

export default function Home() {
  const { t, i18n } = useTranslation(['dashboard', 'appointments', 'admissions']);
  const navigate = useNavigate();
  const statsQuery = useDashboardStats();
  const appointmentsQuery = useDashboardTodayAppointments();
  const admissionsQuery = useDashboardActiveAdmissions();
  const locale = getLocale(i18n.language);
  const stats = statsQuery.data;
  const summaryCards = [
    {
      title: t('dashboard:summary.appointmentsToday'),
      value: statsQuery.isLoading
        ? t('dashboard:summary.loading')
        : statsQuery.error
          ? t('dashboard:summary.unavailable')
          : formatCount(stats?.appointmentsToday ?? 0, locale),
    },
    {
      title: t('dashboard:summary.availableRooms'),
      value: statsQuery.isLoading
        ? t('dashboard:summary.loading')
        : statsQuery.error
          ? t('dashboard:summary.unavailable')
          : formatCount(stats?.availableRooms ?? 0, locale),
    },
    {
      title: t('dashboard:summary.admittedPatients'),
      value: statsQuery.isLoading
        ? t('dashboard:summary.loading')
        : statsQuery.error
          ? t('dashboard:summary.unavailable')
          : formatCount(stats?.admittedPatients ?? 0, locale),
    },
    {
      title: t('dashboard:summary.totalPatients'),
      value: statsQuery.isLoading
        ? t('dashboard:summary.loading')
        : statsQuery.error
          ? t('dashboard:summary.unavailable')
          : formatCount(stats?.totalPatients ?? 0, locale),
    },
    {
      title: t('dashboard:summary.totalDoctors'),
      value: statsQuery.isLoading
        ? t('dashboard:summary.loading')
        : statsQuery.error
          ? t('dashboard:summary.unavailable')
          : formatCount(stats?.totalDoctors ?? 0, locale),
    },
    {
      title: t('dashboard:summary.pendingInvoices'),
      value: statsQuery.isLoading
        ? t('dashboard:summary.loading')
        : statsQuery.error
          ? t('dashboard:summary.unavailable')
          : formatCurrency(stats?.pendingInvoicesAmount ?? 0, 'EUR', locale),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {t('dashboard:title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('dashboard:description')}</p>
        </div>
        <Badge variant="secondary">{t('dashboard:badge')}</Badge>
      </div>

      {statsQuery.error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div>{t('dashboard:summary.error')}</div>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => statsQuery.refetch()}>
            {t('dashboard:actions.retry')}
          </Button>
        </div>
      ) : null}

      {(statsQuery.isFetching || appointmentsQuery.isFetching || admissionsQuery.isFetching) &&
      !(statsQuery.isLoading || appointmentsQuery.isLoading || admissionsQuery.isLoading) ? (
        <p className="text-sm text-muted-foreground">{t('dashboard:sections.refreshing')}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} title={card.title} value={card.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title={t('dashboard:sections.appointmentsTitle')}
          description={t('dashboard:sections.appointmentsDescription')}
          footer={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate(`/app/appointments?date=${encodeURIComponent(getTodayDateValue())}`)
              }
            >
              {t('dashboard:actions.viewAppointments')}
            </Button>
          }
        >
          {appointmentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('dashboard:states.loading')}</p>
          ) : appointmentsQuery.error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              <div>
                {getAppointmentApiMessage(
                  appointmentsQuery.error,
                  t('dashboard:states.appointmentsError')
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => appointmentsQuery.refetch()}
              >
                {t('dashboard:actions.retry')}
              </Button>
            </div>
          ) : !appointmentsQuery.data?.length ? (
            <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-5">
              <p className="text-sm font-semibold text-foreground">
                {t('dashboard:states.appointmentsEmptyTitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('dashboard:states.appointmentsEmptyDescription')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-muted-foreground">
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.time')}</th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.patient')}</th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.doctor')}</th>
                    <th className="px-3 py-3 font-medium">
                      {t('dashboard:fields.specialization')}
                    </th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsQuery.data.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-border/50 last:border-b-0">
                      <td className="px-3 py-3 text-foreground">{appointment.appointmentTime}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground">
                          {getAppointmentPatientName(appointment.patient)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatAppointmentDate(appointment.appointmentDate, i18n.language)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-foreground">
                        {getAppointmentDoctorName(appointment.doctor)}
                      </td>
                      <td className="px-3 py-3 text-foreground">
                        {appointment.doctor.specialization || t('dashboard:labels.notAvailable')}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                          {t(`appointments:statuses.${appointment.status}`)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title={t('dashboard:sections.admissionsTitle')}
          description={t('dashboard:sections.admissionsDescription')}
          footer={
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/app/admissions?status=ACTIVE')}
            >
              {t('dashboard:actions.viewAdmissions')}
            </Button>
          }
        >
          {admissionsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('dashboard:states.loading')}</p>
          ) : admissionsQuery.error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              <div>
                {getAdmissionApiMessage(admissionsQuery.error, t('dashboard:states.admissionsError'))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => admissionsQuery.refetch()}
              >
                {t('dashboard:actions.retry')}
              </Button>
            </div>
          ) : !admissionsQuery.data?.length ? (
            <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-5">
              <p className="text-sm font-semibold text-foreground">
                {t('dashboard:states.admissionsEmptyTitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('dashboard:states.admissionsEmptyDescription')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-muted-foreground">
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.patient')}</th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.room')}</th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.department')}</th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.admittedOn')}</th>
                    <th className="px-3 py-3 font-medium">
                      {t('dashboard:fields.daysAdmitted')}
                    </th>
                    <th className="px-3 py-3 font-medium">{t('dashboard:fields.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {admissionsQuery.data.map((admission) => {
                    const normalizedStatus = normalizeAdmissionStatus(admission.status);
                    const admissionDateValue = getAdmissionDateValue(admission);
                    const daysAdmitted = getDaysAdmitted(admissionDateValue);

                    return (
                      <tr
                        key={admission.id}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        <td className="px-3 py-3 text-foreground">
                          {getAdmissionPatientName(admission.patient)
                            || t('dashboard:labels.notAvailable')}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {getAdmissionRoomLabel(admission.room)
                            || t('dashboard:labels.notAvailable')}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {admission.room?.department?.name || t('dashboard:labels.notAvailable')}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {formatAdmissionDate(admissionDateValue, i18n.language)
                            || t('dashboard:labels.notAvailable')}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {daysAdmitted
                            ? t('dashboard:labels.days', { count: Number(daysAdmitted) })
                            : t('dashboard:labels.notAvailable')}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={getAdmissionStatusVariant(admission.status)}>
                            {isKnownAdmissionStatus(normalizedStatus)
                              ? t(`admissions:statuses.${normalizedStatus}`)
                              : admission.status || t('dashboard:labels.notAvailable')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
