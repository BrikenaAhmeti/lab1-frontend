import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/domain/auth/auth.thunks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';

type NavigationItem = {
  to: string;
  label: string;
  description: string;
  roles?: string[];
  match: (pathname: string) => boolean;
};

const navigationItems: NavigationItem[] = [
  {
    to: '/app',
    label: 'Dashboard',
    description: 'Daily hospital activity',
    match: (pathname) => pathname === '/app',
  },
  {
    to: '/app/transactions',
    label: 'Transactions',
    description: 'Redux Toolkit workflow',
    match: (pathname) => pathname.startsWith('/app/transactions'),
  },
  {
    to: '/app/tan-transactions',
    label: 'Transactions Query',
    description: 'TanStack Query workflow',
    match: (pathname) => pathname.startsWith('/app/tan-transactions'),
  },
  {
    to: '/app/admin',
    label: 'Admin',
    description: 'Users and role controls',
    roles: ['ADMIN'],
    match: (pathname) => pathname.startsWith('/app/admin'),
  },
];

const upcomingModules = [
  'Patients',
  'Doctors',
  'Departments',
  'Appointments',
  'Medical Records',
  'Rooms',
  'Admissions',
  'Invoices',
  'Nurses',
];

const adminRoleSet = new Set(['ADMIN', 'ADMINS', 'SUPER-ADMINS', 'SUPER_ADMIN']);

function normalizeRole(role: string) {
  return role.trim().toUpperCase();
}

function canViewItem(roles: string[], requiredRoles?: string[]) {
  if (!requiredRoles?.length) return true;
  const required = requiredRoles.map(normalizeRole);
  return roles.some((role) => required.includes(role));
}

function getInitials(firstName?: string, lastName?: string) {
  const initialA = firstName?.trim().charAt(0) ?? '';
  const initialB = lastName?.trim().charAt(0) ?? '';
  const initials = `${initialA}${initialB}`.toUpperCase();
  return initials || 'MS';
}

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const roles = useMemo(() => {
    const storedRole = localStorage.getItem('role');
    const sourceRoles = user?.roles?.length ? user.roles : storedRole ? [storedRole] : [];
    return sourceRoles.map(normalizeRole);
  }, [user?.roles]);

  const visibleNavigation = useMemo(
    () => navigationItems.filter((item) => canViewItem(roles, item.roles)),
    [roles]
  );

  const activeNavigation = useMemo(
    () => visibleNavigation.find((item) => item.match(location.pathname)) ?? visibleNavigation[0],
    [location.pathname, visibleNavigation]
  );

  const showRightSidebar = roles.some((role) => adminRoleSet.has(role));
  const displayName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Hospital Staff';
  const userRole = roles[0] ?? 'STAFF';

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
          aria-label="Close navigation"
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
                  <img src="/medsphere.png" alt="Medsphere logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.24em] text-primary">MEDSPHERE</p>
                  <p className="text-sm text-muted-foreground">Hospital Management</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1.5">
                {visibleNavigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app'}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-xl border px-3.5 py-2.5 transition-colors',
                        isActive || item.match(location.pathname)
                          ? 'border-primary/35 bg-primary/10'
                          : 'border-transparent hover:border-border hover:bg-muted/60'
                      )
                    }
                  >
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
                  </NavLink>
                ))}
              </div>

              <section className="mt-6 rounded-2xl border border-border/70 bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Planned Modules
                </p>
                <ul className="mt-3 space-y-2">
                  {upcomingModules.map((module) => (
                    <li key={module} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">{module}</span>
                      <Badge variant="secondary" className="px-2 py-0.5">
                        Soon
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            </nav>

            <div className="border-t border-border/70 px-4 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/70 px-3 py-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className={clsx('flex min-h-screen w-full flex-col lg:pl-72', showRightSidebar && 'xl:pr-80')}>
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
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
                  <p className="truncate text-lg font-bold">{activeNavigation?.label ?? 'Dashboard'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeNavigation?.description ?? 'Hospital system overview'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LanguageSwitch />
                <ThemeToggle />
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>

        {showRightSidebar ? (
          <aside className="fixed inset-y-0 right-0 hidden w-80 border-l border-border/70 bg-card/95 p-6 backdrop-blur xl:flex xl:flex-col">
            <div className="rounded-2xl border border-border/70 bg-surface/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Admin Access</p>
              <p className="mt-2 text-sm font-semibold text-foreground">Security and permission monitoring enabled</p>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-surface/70 p-4">
              <p className="text-sm font-semibold text-foreground">Daily Focus</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Review high-risk admissions and room occupancy</li>
                <li>Validate open invoices and pending approvals</li>
                <li>Check staffing coverage by department</li>
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-surface/70 p-4">
              <p className="text-sm font-semibold text-foreground">System Status</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auth service</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API sync</span>
                <Badge>Stable</Badge>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
