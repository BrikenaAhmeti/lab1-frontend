import clsx from 'clsx';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPersonName } from '../lib/utils';
import { moduleOrder, moduleRouteMeta } from '../module-meta';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const fullName = formatPersonName(user);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div
          className={clsx(
            'fixed inset-0 z-40 bg-slate-950/45 transition md:hidden',
            isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={closeSidebar}
        />

        <aside
          className={clsx(
            'fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-border bg-card px-4 py-5 transition-transform md:sticky md:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="rounded-3xl bg-primary px-4 py-4 text-primary-foreground shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">HMS</p>
            <h2 className="mt-2 text-xl font-bold">{t(commonCopy.appName)}</h2>
            <p className="mt-1 text-sm text-primary-foreground/85">{t(commonCopy.appSubtitle)}</p>
          </div>

          <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                clsx(
                  'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                )
              }
              onClick={closeSidebar}
            >
              {t(commonCopy.dashboard)}
            </NavLink>
            {moduleOrder.map((key) => (
              <NavLink
                key={key}
                to={`/${moduleRouteMeta[key].path}`}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  )
                }
                onClick={closeSidebar}
              >
                {t(moduleRouteMeta[key].label)}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 space-y-3 rounded-3xl border border-border bg-background/70 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{fullName || t(commonCopy.appName)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {(user?.roles || []).join(', ') || 'USER'}
              </p>
            </div>
            <ThemeToggle />
            <LanguageSwitch />
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                closeSidebar();
              }}
            >
              {t(commonCopy.signOut)}
            </Button>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-0">
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsSidebarOpen((current) => !current)}
                >
                  {t(commonCopy.mobileMenu)}
                </Button>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t(commonCopy.appName)}</p>
                  <p className="text-xs text-muted-foreground">{fullName || user?.email || 'User'}</p>
                </div>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <ThemeToggle compact />
                <LanguageSwitch compact />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
