import { z } from 'zod';
import { useState } from 'react';
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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready, isAuthenticated, login, errorMessage } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [loginError, setLoginError] = useState('');
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  if (ready && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden px-3 pb-12 pt-3 md:px-5 md:pb-16 md:pt-5">
      <div className="landing-noise pointer-events-none absolute inset-0" />
      <div className="landing-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="landing-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem]" />
      <div className="landing-orb bottom-[-12rem] right-[-7rem] h-[26rem] w-[26rem]" />

      <div className="relative mx-auto max-w-[1500px]">
        <header className="landing-shell animate-fade-up rounded-[34px] px-5 py-4 md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/45"
            >
              <img src="/medsphere-logo.png" alt="MedSphere" className="h-12 w-auto object-contain" />
              <div className="min-w-0">
                <p className="landing-display truncate text-2xl text-foreground">MedSphere</p>
                <p className="truncate text-sm text-muted-foreground">
                  {t(lt('Secure workspace access', 'Sicherer Zugriff auf den Arbeitsbereich'))}
                </p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <ThemeToggle compact />
              <LanguageSwitch compact />
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-card/80 px-5 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
              >
                {t(lt('Back to website', 'Zur Website zurück'))}
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_420px] xl:items-stretch">
          <section className="landing-shell animate-fade-up rounded-[40px] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/6 px-4 py-2 text-sm font-semibold text-primary shadow-soft">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-beat" />
              {t(lt('Staff portal', 'Mitarbeiterportal'))}
            </div>

            <h1 className="landing-display mt-6 max-w-3xl text-[clamp(2.7rem,5.3vw,5rem)] leading-[0.92] text-foreground">
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

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {loginMetrics.map((item, index) => (
                <article
                  key={item.label.en}
                  className="animate-fade-up rounded-[26px] border border-border/60 bg-white/85 p-4 shadow-soft"
                  style={{ animationDelay: `${150 + index * 100}ms` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t(item.label)}
                  </p>
                  <p className="landing-display mt-3 text-3xl text-foreground">{item.value}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="landing-stage p-4 md:p-5">
                <div className="grid overflow-hidden rounded-[30px] border border-border/60 bg-white xl:grid-cols-[170px_minmax(0,1fr)]">
                  <aside className="flex flex-col gap-3 bg-[linear-gradient(180deg,hsl(212_84%_27%),hsl(217_73%_18%))] p-4 text-white">
                    <div className="rounded-[20px] border border-white/12 bg-white/10 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">MedSphere</p>
                      <p className="mt-1 text-sm text-white/92">{t(lt('Dashboard ready', 'Dashboard bereit'))}</p>
                    </div>
                    {[
                      lt('Overview', 'Überblick'),
                      lt('Patients', 'Patienten'),
                      lt('Appointments', 'Termine'),
                    ].map((item, index) => (
                      <div
                        key={item.en}
                        className={`rounded-[18px] px-3 py-3 text-sm ${index === 0 ? 'bg-white/16 text-white' : 'text-white/72'}`}
                      >
                        {t(item)}
                      </div>
                    ))}
                  </aside>

                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between rounded-[20px] border border-border/60 bg-background/55 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {t(lt('Live overview', 'Live-Überblick'))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(lt('Patients, appointments, rooms', 'Patienten, Termine, Zimmer'))}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {t(lt('Online', 'Online'))}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {t(lt('Care activity', 'Pflegeaktivität'))}
                        </p>
                        <p className="landing-display mt-3 text-3xl text-foreground">78%</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-600">+6.2%</p>
                      </div>
                      <div className="rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {t(lt('Records synced', 'Synchronisierte Akten'))}
                        </p>
                        <p className="landing-display mt-3 text-3xl text-foreground">12k+</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-600">+14.1%</p>
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {t(lt('Security status', 'Sicherheitsstatus'))}
                          </p>
                          <p className="landing-display mt-3 text-3xl text-foreground">100%</p>
                        </div>
                        <svg viewBox="0 0 160 70" className="h-16 w-36">
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
