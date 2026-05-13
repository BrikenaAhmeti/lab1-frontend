import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import { commonCopy } from '../copy';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';

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
