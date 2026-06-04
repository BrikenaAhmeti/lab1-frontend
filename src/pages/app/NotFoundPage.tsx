import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import { commonCopy } from '@/config/copy';
import EmptyState from '@/ui/molecules/EmptyState';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-xl">
        <EmptyState
          title={t(commonCopy.notFoundTitle)}
          description={t(commonCopy.notFoundPageDescription)}
          action={
            <Link to="/dashboard">
              <Button>{t(commonCopy.backToDashboard)}</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
