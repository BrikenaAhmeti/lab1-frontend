import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { logout } from '@/domain/auth/auth.thunks';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { moduleNavigation } from '@/config/moduleNavigation';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeNavigation = useMemo(
    () =>
      moduleNavigation.find(
        (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
      ),
    [location.pathname]
  );

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.15),transparent_48%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.18),transparent_45%)]" />
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label={t('shell.mobileClose')}
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className="relative flex min-h-screen">
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-72 border-r border-border/70 bg-card/95 backdrop-blur transition-transform duration-200 lg:translate-x-0',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/70 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-2 shadow-soft">
                  <img src="/medsphere.png" alt={t('shell.logoAlt')} className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.24em] text-primary">{t('appTitle')}</p>
                  <p className="text-sm text-muted-foreground">{t('shell.brandSubtitle')}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border/70 bg-surface/80 p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {t('shell.settingsTitle')}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <LanguageSwitch compact />
                  <ThemeToggle compact />
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1.5">
                {moduleNavigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-xl border px-3.5 py-3 text-sm font-semibold transition-colors',
                        isActive
                          ? 'border-primary/35 bg-primary/10'
                          : 'border-transparent hover:border-border hover:bg-muted/60'
                      )
                    }
                  >
                    <div className="text-foreground">{t(item.labelKey)}</div>
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        <div className="flex min-h-screen w-full flex-col lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label={mobileNavOpen ? t('shell.mobileClose') : t('shell.mobileOpen')}
                  aria-expanded={mobileNavOpen}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-colors hover:bg-muted/60 lg:hidden"
                  onClick={() => setMobileNavOpen((state) => !state)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                    {mobileNavOpen ? (
                      <path d="m5 5 14 14M19 5 5 19" />
                    ) : (
                      <>
                        <path d="M4 7h16" />
                        <path d="M4 12h16" />
                        <path d="M4 17h16" />
                      </>
                    )}
                  </svg>
                </button>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">
                    {activeNavigation ? t(activeNavigation.labelKey) : t('shell.defaultTitle')}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeNavigation ? t(activeNavigation.descriptionKey) : t('shell.defaultDescription')}
                  </p>
                </div>
              </div>

              <Button size="sm" variant="outline" className="shrink-0" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
