import clsx from 'clsx';
import { commonCopy } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';

const langs = [
  { code: 'en', shortLabel: 'EN', label: 'English' },
  { code: 'de', shortLabel: 'DE', label: 'Deutsch' },
];

type LanguageSwitchProps = {
  compact?: boolean;
};

const LanguageSwitch = ({ compact = false }: LanguageSwitchProps) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="block min-w-0" htmlFor="sidebar-language">
      {!compact ? (
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t(commonCopy.language)}
        </span>
      ) : (
        <span className="sr-only">{t(commonCopy.language)}</span>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a14 14 0 0 1 0 18" />
            <path d="M12 3a14 14 0 0 0 0 18" />
          </svg>
        </span>
        <select
          id="sidebar-language"
          aria-label={t(commonCopy.language)}
          className={clsx(
            'h-9 w-full appearance-none rounded-xl border border-border/70 bg-background/90 pr-8 text-xs font-semibold text-foreground outline-none transition',
            compact ? 'pl-7' : 'pl-8',
            'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/35'
          )}
          value={language}
          onChange={(event) => setLanguage(event.target.value as 'en' | 'de')}
        >
          {langs.map((item) => (
            <option key={item.code} value={item.code}>
              {compact ? item.shortLabel : `${item.shortLabel} - ${item.label}`}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
            <path d="M5.5 7.5 10 12l4.5-4.5" />
          </svg>
        </span>
      </div>
    </label>
  );
};
export default LanguageSwitch;
