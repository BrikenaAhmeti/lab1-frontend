import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(commonCopy.emptyDescription)}</p>
      </div>
    </div>
  );
}
