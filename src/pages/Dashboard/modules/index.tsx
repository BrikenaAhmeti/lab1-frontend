import { useTranslation } from 'react-i18next';
import type { ModuleKey } from '@/config/moduleNavigation';
import Badge from '@/ui/atoms/Badge';
import Card from '@/ui/atoms/Card';

type ModulePageProps = {
  moduleKey: ModuleKey;
};

export default function ModulePage({ moduleKey }: ModulePageProps) {
  const { t } = useTranslation('common');
  const title = t(`modules.${moduleKey}.title`);
  const description = t(`modules.${moduleKey}.description`);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary">{t('modulePage.badge')}</Badge>
      </div>

      <Card
        title={t('modulePage.overviewTitle', { module: title })}
        description={t('modulePage.overviewDescription', { module: title })}
      >
        <p className="text-sm text-muted-foreground">{t('modulePage.overviewBody', { module: title })}</p>
      </Card>

      <Card title={t('modulePage.helperTitle')} description={t('modulePage.helperDescription')}>
        <p className="text-sm text-muted-foreground">{t('modulePage.helperBody')}</p>
      </Card>
    </section>
  );
}
