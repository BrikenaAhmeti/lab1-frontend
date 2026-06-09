import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy, lt } from '@/config/copy';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useToast } from '@/app/contexts/ToastContext';
import {
  clearStoredAuthReturnTo,
  getReturnToFromRouteState,
  readStoredAuthReturnTo,
  resolveAuthReturnTo,
} from '@/libs/app/navigation';

const schema = z.object({
  identifier: z.string().trim().min(1, 'Please enter your email or username.'),
  password: z.string().trim().min(1, 'Please enter your password.'),
});

const loginHighlights = [
  lt('The same MedSphere palette and dashboard language', 'Dieselbe MedSphere-Palette und Dashboardsprache'),
  lt('Secure staff access with a clear public-to-private handoff', 'Sicherer Personalzugang mit klarem Übergang von öffentlich zu intern'),
  lt('Fast access to patients, rooms, appointments, and reports', 'Schneller Zugriff auf Patienten, Zimmer, Termine und Berichte'),
];

const loginMetrics = [
  { label: lt('Active Patients', 'Aktive Patienten'), value: '2,543' },
  { label: lt("Today's Appointments", 'Heutige Termine'), value: '32' },
  { label: lt('Secure Records', 'Sichere Akten'), value: '100%' },
];

const demoNavigation = [
  { label: lt('Overview', 'Überblick'), icon: 'overview' },
  { label: lt('Patients', 'Patienten'), icon: 'patients' },
  { label: lt('Appointments', 'Termine'), icon: 'appointments' },
];

function LoginIcon({ kind, className = 'h-5 w-5 fill-none stroke-current stroke-[1.8]' }: { kind: string; className?: string }) {
  switch (kind) {
    case 'overview':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 13h7V4H4zm9 7h7V11h-7zm0-16v5h7V4zM4 20h7v-5H4z" />
        </svg>
      );
    case 'patients':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );
    case 'appointments':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z" />
        </svg>
      );
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready, isAuthenticated, login, errorMessage } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [loginError, setLoginError] = useState('');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const queryReturnTo = new URLSearchParams(location.search).get('returnTo');
  const redirectTo = resolveAuthReturnTo([
    queryReturnTo,
    getReturnToFromRouteState(location.state),
    readStoredAuthReturnTo(),
  ]);
  const headerMenuLabel = t(
    isHeaderMenuOpen ? lt('Close menu', 'Menü schließen') : lt('Open menu', 'Menü öffnen')
  );
  const demoMenuLabel = t(
    isDemoMenuOpen ? lt('Close dashboard menu', 'Dashboard-Menü schließen') : lt('Open dashboard menu', 'Dashboard-Menü öffnen')
  );

  useEffect(() => {
    if (ready && isAuthenticated) {
      clearStoredAuthReturnTo();
    }
  }, [isAuthenticated, ready]);

  if (ready && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden px-3 pb-12 pt-3 md:px-5 md:pb-16 md:pt-5">
      <div className="landing-noise pointer-events-none absolute inset-0" />
      <div className="landing-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="landing-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem]" />
      <div className="landing-orb bottom-[-12rem] right-[-7rem] h-[26rem] w-[26rem]" />

      <div className="relative mx-auto max-w-[1500px]">
        <header className="landing-shell animate-fade-up rounded-[34px] px-5 py-4 md:px-7">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex min-w-0 items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/45"
            >
              <img src="/medsphere-logo.png" alt="MedSphere" className="h-10 w-auto shrink-0 object-contain sm:h-12" />
              <div className="min-w-0">
                <p className="landing-display truncate text-xl text-foreground sm:text-2xl">MedSphere</p>
                <p className="truncate text-sm text-muted-foreground">
                  {t(lt('Secure workspace access', 'Sicherer Zugriff auf den Arbeitsbereich'))}
                </p>
              </div>
            </Link>

            <button
              type="button"
              aria-label={headerMenuLabel}
              aria-expanded={isHeaderMenuOpen}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-foreground shadow-soft transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 xl:hidden"
              onClick={() => setIsHeaderMenuOpen((current) => !current)}
            >
              <LoginIcon kind={isHeaderMenuOpen ? 'close' : 'menu'} />
            </button>

            <div className="hidden flex-wrap items-center gap-3 xl:flex xl:justify-end">
              <ThemeToggle compact />
              <LanguageSwitch compact />
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/70 bg-card/80 px-5 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
              >
                <LoginIcon kind="home" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" />
                {t(lt('Back to website', 'Zur Website zurück'))}
              </Link>
            </div>
          </div>

          {isHeaderMenuOpen ? (
            <div className="mt-4 grid gap-3 rounded-[24px] border border-border/60 bg-background/70 p-3 shadow-soft xl:hidden">
              <div className="grid gap-2 min-[460px]:grid-cols-2">
                <ThemeToggle compact />
                <LanguageSwitch compact />
              </div>
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/70 bg-card/85 px-4 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
                onClick={() => setIsHeaderMenuOpen(false)}
              >
                <LoginIcon kind="home" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" />
                {t(lt('Back to website', 'Zur Website zurück'))}
              </Link>
            </div>
          ) : null}
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_420px] xl:items-stretch">
          <section className="landing-shell animate-fade-up rounded-[40px] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/6 px-4 py-2 text-sm font-semibold text-primary shadow-soft">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-beat" />
              {t(lt('Staff portal', 'Mitarbeiterportal'))}
            </div>

            <h1 className="landing-display mt-6 max-w-3xl text-[2.7rem] leading-[0.92] text-foreground sm:text-[3.45rem] lg:text-[4.3rem] 2xl:text-[5rem]">
              {t(lt('Secure access for every', 'Sicherer Zugang für jedes'))}
              <span className="block landing-highlight">{t(lt('MedSphere team.', 'MedSphere-Team.'))}</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                lt(
                  'The workspace keeps the same calm visual language as the public site, so the move from first impression to real operations stays connected.',
                  'Der Arbeitsbereich bewahrt dieselbe ruhige visuelle Sprache wie die öffentliche Website, damit der Wechsel vom ersten Eindruck zur täglichen Arbeit stimmig bleibt.'
                )
              )}
            </p>

            <div className="mt-8 grid gap-3 min-[560px]:grid-cols-3">
              {loginMetrics.map((item, index) => (
                <article
                  key={item.label.en}
                  className="min-w-0 animate-fade-up overflow-hidden rounded-[24px] border border-border/60 bg-white/85 p-4 shadow-soft sm:p-5"
                  style={{ animationDelay: `${150 + index * 100}ms` }}
                >
                  <p className="break-words text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                    {t(item.label)}
                  </p>
                  <p className="landing-display mt-3 break-words text-[2.35rem] leading-none text-foreground sm:text-[2.65rem]">
                    {item.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="landing-stage p-4 md:p-5">
                <div className="grid min-w-0 overflow-hidden rounded-[26px] border border-border/60 bg-white sm:rounded-[30px] 2xl:grid-cols-[170px_minmax(0,1fr)]">
                  <aside className="bg-[linear-gradient(180deg,hsl(212_84%_27%),hsl(217_73%_18%))] p-3 text-white sm:p-4 2xl:flex 2xl:flex-col 2xl:gap-3">
                    <div className="flex items-center justify-between gap-3 2xl:block">
                      <div className="min-w-0 rounded-[20px] border border-white/12 bg-white/10 px-3 py-3">
                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.22em]">
                          MedSphere
                        </p>
                        <p className="mt-1 truncate text-sm text-white/92">
                          {t(lt('Dashboard ready', 'Dashboard bereit'))}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={demoMenuLabel}
                        aria-expanded={isDemoMenuOpen}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 2xl:hidden"
                        onClick={() => setIsDemoMenuOpen((current) => !current)}
                      >
                        <LoginIcon kind={isDemoMenuOpen ? 'close' : 'menu'} />
                      </button>
                    </div>

                    <nav
                      className={`${
                        isDemoMenuOpen ? 'grid' : 'hidden'
                      } mt-3 grid-cols-3 gap-2 2xl:mt-0 2xl:flex 2xl:flex-col 2xl:gap-3`}
                    >
                      {demoNavigation.map((item, index) => (
                        <div
                          key={item.label.en}
                          className={`flex min-w-0 flex-col items-center gap-1.5 rounded-[16px] px-2 py-2 text-center text-[11px] font-semibold sm:text-xs 2xl:flex-row 2xl:gap-2.5 2xl:rounded-[18px] 2xl:px-3 2xl:py-3 2xl:text-left 2xl:text-sm ${
                            index === 0 ? 'bg-white/16 text-white' : 'text-white/72'
                          }`}
                        >
                          <span
                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border ${
                              index === 0 ? 'border-white/16 bg-white/16 text-white' : 'border-white/10 bg-white/8'
                            }`}
                          >
                            <LoginIcon kind={item.icon} className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" />
                          </span>
                          <span className="min-w-0 truncate">{t(item.label)}</span>
                        </div>
                      ))}
                    </nav>
                  </aside>

                  <div className="min-w-0 space-y-3 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 rounded-[20px] border border-border/60 bg-background/55 px-3 py-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between sm:px-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {t(lt('Live overview', 'Live-Überblick'))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(lt('Patients, appointments, rooms', 'Patienten, Termine, Zimmer'))}
                        </p>
                      </div>
                      <span className="self-start rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700 min-[520px]:self-auto">
                        {t(lt('Online', 'Online'))}
                      </span>
                    </div>

                    <div className="grid gap-3 min-[480px]:grid-cols-2">
                      <div className="min-w-0 overflow-hidden rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                        <p className="break-words text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                          {t(lt('Care activity', 'Pflegeaktivität'))}
                        </p>
                        <p className="landing-display mt-3 break-words text-[2.25rem] leading-none text-foreground sm:text-[2.5rem]">
                          78%
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-600">+6.2%</p>
                      </div>
                      <div className="min-w-0 overflow-hidden rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                        <p className="break-words text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                          {t(lt('Records synced', 'Synchronisierte Akten'))}
                        </p>
                        <p className="landing-display mt-3 break-words text-[2.25rem] leading-none text-foreground sm:text-[2.5rem]">
                          12k+
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-600">+14.1%</p>
                      </div>
                    </div>

                    <div className="min-w-0 overflow-hidden rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                      <div className="flex flex-col gap-3 min-[460px]:flex-row min-[460px]:items-end min-[460px]:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                            {t(lt('Security status', 'Sicherheitsstatus'))}
                          </p>
                          <p className="landing-display mt-3 break-words text-[2.25rem] leading-none text-foreground sm:text-[2.5rem]">
                            100%
                          </p>
                        </div>
                        <svg viewBox="0 0 160 70" className="h-14 w-32 shrink-0 self-end sm:h-16 sm:w-36">
                          <path
                            d="M8 56C22 56 28 22 44 22C60 22 62 46 78 46C94 46 98 16 114 16C130 16 136 34 152 34"
                            fill="none"
                            stroke="url(#login-chart)"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="login-chart" x1="8" x2="152" y1="0" y2="0">
                              <stop offset="0%" stopColor="hsl(var(--secondary))" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {loginHighlights.map((item) => (
                  <article key={item.en} className="rounded-[24px] border border-border/60 bg-white/80 p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                          <path d="m5 12 4 4 10-10" />
                        </svg>
                      </span>
                      <p className="text-sm leading-7 text-foreground">{t(item)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="landing-shell animate-fade-up rounded-[40px] p-6 md:p-7 [animation-delay:120ms]">
            <div className="inline-flex rounded-full border border-primary/16 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {t(lt('Log in', 'Anmelden'))}
            </div>
            <h2 className="landing-display mt-4 text-4xl text-foreground">{t(commonCopy.loginTitle)}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(commonCopy.loginDescription)}</p>

            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                setLoginError('');

                try {
                  await login(values);
                  showToast(t(commonCopy.loginSuccess), 'success');
                  clearStoredAuthReturnTo();
                  navigate(redirectTo, { replace: true });
                } catch (error) {
                  setLoginError(errorMessage(error, t));
                }
              })}
            >
              <Input
                label={t(commonCopy.identifier)}
                error={String(form.formState.errors.identifier?.message || '')}
                {...form.register('identifier', {
                  onChange: () => setLoginError(''),
                })}
              />
              <Input
                type="password"
                label={t(commonCopy.password)}
                error={String(form.formState.errors.password?.message || '')}
                {...form.register('password', {
                  onChange: () => setLoginError(''),
                })}
              />
              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-white"
                loading={form.formState.isSubmitting}
              >
                {t(commonCopy.signIn)}
              </Button>
              {loginError ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                >
                  {loginError}
                </p>
              ) : null}
            </form>

            <div className="mt-5 rounded-[26px] border border-border/60 bg-background/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {t(lt('Need the overview first?', 'Brauchen Sie zuerst den Überblick?'))}
              </p>
              <Link
                to="/"
                className="mt-2 inline-flex text-sm font-semibold text-foreground transition hover:text-primary"
              >
                {t(lt('Go back to the guest homepage', 'Zur öffentlichen Startseite zurück'))}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
