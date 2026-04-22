import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';

type ThemeToggleProps = {
  compact?: boolean;
};

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { t } = useTranslation('common');
  const { mode, setMode } = useThemeMode();
  const isDark =
    mode === 'dark' ||
    (mode === 'system' &&
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'));
  const themeLabel = t(isDark ? 'themeOptions.dark' : 'themeOptions.light');

  return (
    <div className="min-w-0">
      {!compact ? (
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t('theme')}
        </span>
      ) : (
        <span className="sr-only">{t('theme')}</span>
      )}
      <button
        type="button"
        aria-label={`${t('theme')}: ${themeLabel}`}
        aria-pressed={isDark}
        className={clsx(
          'flex h-9 w-full items-center justify-between rounded-xl border border-border/70 bg-background/90 text-left transition hover:border-primary/30 hover:bg-muted/35',
          compact ? 'gap-1 px-2' : 'px-2.5'
        )}
        onClick={() => setMode(isDark ? 'light' : 'dark')}
      >
        <span
          className={clsx(
            'inline-flex min-w-0 items-center text-xs font-semibold text-foreground',
            compact ? 'gap-1.5' : 'gap-2'
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
            {isDark ? (
              <path d="M20 15.5A8.5 8.5 0 1 1 8.5 4 7 7 0 0 0 20 15.5Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
              </>
            )}
          </svg>
          <span className="truncate">{themeLabel}</span>
        </span>
        <span
          className={clsx(
            'relative rounded-full transition-colors',
            compact ? 'h-[18px] w-8' : 'h-5 w-10',
            isDark ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={clsx(
              'absolute rounded-full bg-background shadow-sm transition-transform',
              compact ? 'top-[2px] h-3.5 w-3.5' : 'top-0.5 h-4 w-4',
              isDark ? (compact ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0.5'
            )}
          />
        </span>
      </button>
    </div>
  );
}
