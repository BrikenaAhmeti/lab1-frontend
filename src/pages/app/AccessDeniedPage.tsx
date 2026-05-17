import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import { commonCopy } from '@/config/copy';
import EmptyState from '@/ui/molecules/EmptyState';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AccessDeniedPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <EmptyState
        tone="locked"
        title={t(commonCopy.forbiddenTitle)}
        description={t(commonCopy.accessDeniedDescription)}
        action={
          <Link to="/dashboard">
            <Button>{t(commonCopy.backToDashboard)}</Button>
          </Link>
        }
      />
    </div>
  );
}
