import clsx from 'clsx';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy, lt } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPersonName } from '../lib/utils';
import { moduleOrder, moduleRouteMeta } from '../module-meta';
import type { ModuleKey } from '../types';

type NavItem = {
  key: 'dashboard' | ModuleKey;
  to: string;
  label: string;
  description: string;
};

const moduleDescriptions: Record<ModuleKey, ReturnType<typeof lt>> = {
  patients: lt('Records, intake, and current care plans', 'Kartela, pranime dhe plane kujdesi'),
  doctors: lt('Availability, teams, and medical coverage', 'Disponueshmeri, ekipe dhe mbulim mjekesor'),
  departments: lt('Teams, specialties, and structure', 'Ekipe, specialitete dhe strukture'),
  appointments: lt('Visits, schedules, and daily flow', 'Vizita, orare dhe rrjedhe ditore'),
  'medical-records': lt('Clinical history and documentation', 'Histori klinike dhe dokumentim'),
  prescriptions: lt('Medication orders and linked records', 'Urdhra ilaçesh dhe kartela te lidhura'),
  rooms: lt('Capacity, availability, and occupancy', 'Kapacitet, disponueshmeri dhe zënie'),
  admissions: lt('Check-ins, stays, and discharge flow', 'Pranime, qendrime dhe dalje'),
  invoices: lt('Billing, balances, and payments', 'Faturim, balanca dhe pagesa'),
  nurses: lt('Coverage, shifts, and ward support', 'Mbulim, turne dhe mbeshtetje reparti'),
};

function initialsFromUser(fullName: string, email?: string) {
  const pieces = fullName.split(' ').filter(Boolean);

  if (pieces.length >= 2) {
    return `${pieces[0][0]}${pieces[1][0]}`.toUpperCase();
  }

  if (pieces.length === 1) {
    return pieces[0].slice(0, 2).toUpperCase();
  }

  return (email || 'MS').slice(0, 2).toUpperCase();
}

function iconForKey(key: NavItem['key']) {
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
    case 'medical-records':
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const fullName = formatPersonName(user) || 'MedSphere User';
  const initials = initialsFromUser(fullName, user?.email);
  const menuLabel = t(isSidebarOpen ? lt('Close navigation', 'Mbyll navigimin') : lt('Open navigation', 'Hap navigimin'));

  const navigationItems: NavItem[] = [
    {
      key: 'dashboard',
      to: '/dashboard',
      label: t(commonCopy.dashboard),
      description: t(lt('Live hospital overview and operations', 'Pamje operative dhe aktivitet spitalor')),
    },
    ...moduleOrder.map((key) => ({
      key,
      to: `/${moduleRouteMeta[key].path}`,
      label: t(moduleRouteMeta[key].label),
      description: t(moduleDescriptions[key]),
    })),
  ];

  const activeItem =
    navigationItems.find((item) =>
      item.to === '/dashboard'
        ? location.pathname === item.to
        : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
    ) || navigationItems[0];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="workspace-page relative min-h-screen overflow-hidden">
      <div className="workspace-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="landing-orb left-[-12rem] top-[-8rem] h-[24rem] w-[24rem]" />
      <div className="landing-orb bottom-[-14rem] right-[-8rem] h-[26rem] w-[26rem]" />

      <div className="relative min-h-screen">
        <button
          type="button"
          aria-label={menuLabel}
          className={clsx(
            'fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition md:hidden',
            isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={closeSidebar}
        />

        <aside
          className={clsx(
            'workspace-shell workspace-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[calc(100vw-1.5rem)] flex-col rounded-r-[24px] border border-l-0 border-white/10 text-white shadow-[0_34px_80px_hsl(214_78%_18%/0.34)] transition-transform duration-300 md:w-[252px] md:max-w-[252px] md:translate-x-0 md:rounded-none md:border-y-0 md:border-l-0 lg:w-[280px] lg:max-w-[280px]',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-[112%]'
          )}
        >
          <div className="flex h-full flex-col p-3">
            <div className="flex items-start justify-between gap-3">
              <NavLink
                to="/dashboard"
                end
                className="flex min-w-0 items-center gap-2 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/45"
                onClick={closeSidebar}
              >
                <img src="/medsphere.png" alt="MedSphere logo" className="h-10 w-auto object-contain" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72">
                    MedSphere
                  </p>
                  <p className="truncate text-sm text-sky-50/78">{t(commonCopy.appSubtitle)}</p>
                </div>
              </NavLink>

              <button
                type="button"
                aria-label={t(lt('Close menu', 'Mbyll menune'))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white transition hover:bg-white/16 md:hidden"
                onClick={closeSidebar}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-1.5">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-start gap-2.5 rounded-[18px] border px-3 py-2.5 transition duration-200',
                        isActive
                          ? 'border-white/14 bg-[linear-gradient(135deg,hsl(var(--accent)/0.28),hsl(var(--secondary)/0.16),hsl(0_0%_100%/0.08))] shadow-soft'
                          : 'border-transparent hover:border-white/10 hover:bg-white/6'
                      )
                    }
                    onClick={closeSidebar}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={clsx(
                            'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border transition',
                            isActive
                              ? 'border-white/14 bg-white/16 text-white'
                              : 'border-white/10 bg-white/8 text-white/70 group-hover:text-white'
                          )}
                        >
                          {iconForKey(item.key)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-white">{item.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-sky-50/70">
                            {item.description}
                          </span>
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="mt-3 rounded-[22px] border border-white/12 bg-white/10 p-3 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.05)]">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--secondary)))] text-sm font-bold text-white shadow-soft">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{fullName}</p>
                  <p className="truncate text-xs text-sky-50/70">{user?.email || 'care@medsphere.app'}</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="mt-3 h-10 w-full rounded-[16px] border-white/10 bg-white text-primary hover:bg-white/90"
                onClick={async () => {
                  await logout();
                  closeSidebar();
                }}
              >
                {t(commonCopy.signOut)}
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-col gap-4 p-3 md:ml-[252px] md:p-4 lg:ml-[280px]">
          <header className="workspace-shell workspace-topbar sticky top-4 z-30 rounded-[32px] px-4 py-3 shadow-panel md:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  aria-label={menuLabel}
                  aria-expanded={isSidebarOpen}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-foreground transition hover:bg-muted/60 md:hidden"
                  onClick={() => setIsSidebarOpen((current) => !current)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                    {isSidebarOpen ? (
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
                    {t(lt('Workspace view', 'Pamja e hapesires'))}
                  </p>
                  <p className="landing-display mt-1 truncate text-2xl text-foreground">{activeItem.label}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{activeItem.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <NavLink
                  to="/"
                  className="hidden h-11 items-center justify-center rounded-full border border-border/70 bg-card/70 px-4 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-card/90 lg:inline-flex"
                >
                  {t(lt('Guest site', 'Faqja publike'))}
                </NavLink>
                <ThemeToggle compact />
                <LanguageSwitch compact />
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-4">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
