import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/domain/auth/auth.thunks';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { moduleNavigation, type ModuleKey } from '@/config/moduleNavigation';

function initialsFromName(name: string, email?: string) {
  const parts = name.split(' ').filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (email || 'MS').slice(0, 2).toUpperCase();
}

function iconForKey(key: ModuleKey) {
  const iconClass = 'h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]';

  switch (key) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M4 13h7V4H4zm9 7h7V11h-7zm0-16v5h7V4zM4 20h7v-5H4z" />
        </svg>
      );
    case 'patients':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );
    case 'doctors':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M12 4v16M8 8h8M8 12h8" />
          <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
        </svg>
      );
    case 'departments':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <rect x="4" y="5" width="6" height="6" rx="1.5" />
          <rect x="14" y="5" width="6" height="6" rx="1.5" />
          <rect x="9" y="14" width="6" height="6" rx="1.5" />
          <path d="M12 11v3" />
        </svg>
      );
    case 'appointments':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <path d="M8 3v4M16 3v4M4 10h16M12 13v4M10 15h4" />
        </svg>
      );
    case 'medicalRecords':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M8 4h7l4 4v12H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" />
          <path d="M15 4v5h5M10 13h5M10 17h5" />
        </svg>
      );
    case 'prescriptions':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="m7 7 10 10M9.5 4.5a3.5 3.5 0 1 1-5 5l5-5Zm10 10a3.5 3.5 0 1 1-5 5l5-5Z" />
        </svg>
      );
    case 'rooms':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M4 18V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
          <path d="M4 14h16M7 10h3M8 18v2m8-2v2" />
        </svg>
      );
    case 'admissions':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M12 4v16M6 10h12M7 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'invoices':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M7 4h10v16l-2-1.5L13 20l-2-1.5L9 20l-2-1.5L5 20V6a2 2 0 0 1 2-2Z" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      );
    case 'nurses':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
          <path d="M12 4v8M8 8h8" />
          <circle cx="12" cy="16.5" r="3.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation('common');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'MedSphere User';
  const initials = initialsFromName(fullName, user?.email);

  const activeNavigation = useMemo(
    () =>
      moduleNavigation.find((item) =>
        item.to === '/app'
          ? location.pathname === item.to
          : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
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
    <div className="workspace-page relative min-h-screen overflow-hidden text-foreground">
      <div className="workspace-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="landing-orb left-[-12rem] top-[-8rem] h-[24rem] w-[24rem]" />
      <div className="landing-orb bottom-[-14rem] right-[-8rem] h-[26rem] w-[26rem]" />

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label={t('shell.mobileClose')}
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-4 px-4 py-4 md:px-5">
        <aside
          className={clsx(
            'workspace-shell workspace-sidebar fixed inset-y-4 left-4 z-40 flex w-72 max-w-[calc(100vw-2rem)] flex-col rounded-[34px] border-white/10 text-white shadow-[0_34px_80px_hsl(214_78%_18%/0.34)] transition-transform duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:self-start lg:translate-x-0',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-[112%]'
          )}
        >
          <div className="flex h-full flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <NavLink
                to="/app"
                end
                className="flex min-w-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
              >
                <img
                  src="/medsphere.png"
                  alt={t('shell.logoAlt')}
                  className="h-10 w-auto max-w-[min(100%,200px)] object-contain object-left"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.32em] text-white/72">
                    MedSphere
                  </p>
                  <p className="truncate text-sm text-sky-50/78">{t('shell.brandSubtitle')}</p>
                </div>
              </NavLink>

              <button
                type="button"
                aria-label={t('shell.mobileClose')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white transition hover:bg-white/16 lg:hidden"
                onClick={() => setMobileNavOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/12 bg-white/10 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.05)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-beat" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/72">
                  {t('shell.brandSubtitle')}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-sky-50/78">
                {activeNavigation ? t(activeNavigation.descriptionKey) : t('shell.defaultDescription')}
              </p>
            </div>

            <nav className="mt-5 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                {moduleNavigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app'}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-start gap-3 rounded-[24px] border px-3.5 py-3 transition duration-200',
                        isActive
                          ? 'border-white/14 bg-[linear-gradient(135deg,hsl(var(--accent)/0.28),hsl(var(--secondary)/0.16),hsl(0_0%_100%/0.08))] shadow-soft'
                          : 'border-transparent hover:border-white/10 hover:bg-white/6'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={clsx(
                            'mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition',
                            isActive
                              ? 'border-white/14 bg-white/16 text-white'
                              : 'border-white/10 bg-white/8 text-white/70 group-hover:text-white'
                          )}
                        >
                          {iconForKey(item.key)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-white">{t(item.labelKey)}</span>
                          <span className="mt-1 block text-xs leading-5 text-sky-50/70">
                            {t(item.descriptionKey)}
                          </span>
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="mt-5 rounded-[30px] border border-white/12 bg-white/10 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.05)]">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--secondary)))] text-sm font-bold text-white shadow-soft">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{fullName}</p>
                  <p className="truncate text-xs text-sky-50/70">{user?.email || 'care@medsphere.app'}</p>
                </div>
              </div>

              <Button size="sm" variant="outline" className="mt-4 w-full rounded-full border-white/10 bg-white text-primary hover:bg-white/90" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen w-full min-w-0 flex-col gap-4 lg:self-start">
          <header className="workspace-shell workspace-topbar sticky top-4 z-20 rounded-[32px] px-4 py-3 shadow-panel md:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  aria-label={mobileNavOpen ? t('shell.mobileClose') : t('shell.mobileOpen')}
                  aria-expanded={mobileNavOpen}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-foreground transition hover:bg-muted/60 lg:hidden"
                  onClick={() => setMobileNavOpen((state) => !state)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                    {mobileNavOpen ? (
                      <path d="m6 6 12 12M18 6 6 18" />
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
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                    {t('shell.defaultTitle')}
                  </p>
                  <p className="landing-display mt-1 truncate text-2xl text-foreground">
                    {activeNavigation ? t(activeNavigation.labelKey) : t('shell.defaultTitle')}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {activeNavigation ? t(activeNavigation.descriptionKey) : t('shell.defaultDescription')}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <ThemeToggle compact />
                <LanguageSwitch compact />
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
