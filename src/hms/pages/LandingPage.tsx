import { Link } from 'react-router-dom';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy, lt } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';

const headerLinks = [
  { href: '#features', label: lt('Features', 'Funktionen') },
  { href: '#dashboard', label: lt('Dashboard', 'Dashboard') },
  { href: '#solutions', label: lt('Solutions', 'Lösungen') },
  { href: '#pricing', label: lt('Pricing', 'Preise') },
  { href: '#page-end', label: lt('Contact', 'Kontakt') },
];

const dashboardMenu = [
  lt('Overview', 'Überblick'),
  lt('Patients', 'Patienten'),
  lt('Appointments', 'Termine'),
  lt('Analytics', 'Analysen'),
  lt('Records', 'Akten'),
];

const overviewStats = [
  { label: lt('Active Patients', 'Aktive Patienten'), value: '2,543', delta: '+12.5%' },
  { label: lt("Today's Appointments", 'Heutige Termine'), value: '32', delta: '+8.2%' },
  { label: lt('Treatments', 'Behandlungen'), value: '1,280', delta: '+15.3%' },
  { label: lt('Revenue', 'Umsatz'), value: '$128,540', delta: '+10.7%' },
];

const appointmentRows = [
  {
    name: 'John Smith',
    detail: lt('General checkup', 'Allgemeine Untersuchung'),
    time: '9:00 AM',
    status: lt('Confirmed', 'Bestätigt'),
    tone: 'bg-emerald-500/12 text-emerald-700',
  },
  {
    name: 'Emily Davis',
    detail: lt('Cardiology follow-up', 'Kardiologische Nachkontrolle'),
    time: '10:30 AM',
    status: lt('Confirmed', 'Bestätigt'),
    tone: 'bg-sky-500/12 text-sky-700',
  },
  {
    name: 'Michael Brown',
    detail: lt('Lab test', 'Labortest'),
    time: '11:15 AM',
    status: lt('Pending', 'Ausstehend'),
    tone: 'bg-amber-500/14 text-amber-700',
  },
  {
    name: 'Sarah Wilson',
    detail: lt('Consultation', 'Beratung'),
    time: '1:30 PM',
    status: lt('Pending', 'Ausstehend'),
    tone: 'bg-amber-500/14 text-amber-700',
  },
];

const trustSignals = [
  {
    kind: 'shield',
    title: lt('HIPAA compliant', 'HIPAA-konform'),
    body: lt('Your data is always secure', 'Ihre Daten sind jederzeit sicher'),
  },
  {
    kind: 'cloud',
    title: lt('Cloud based', 'Cloudbasiert'),
    body: lt('Access anywhere, anytime', 'Zugriff überall und jederzeit'),
  },
  {
    kind: 'bolt',
    title: lt('Real-time insights', 'Einblicke in Echtzeit'),
    body: lt('Make smarter decisions', 'Treffen Sie bessere Entscheidungen'),
  },
];

const featureCards = [
  {
    kind: 'patients',
    title: lt('Patient Management', 'Patientenverwaltung'),
    body: lt(
      'Centralize patient profiles, history, and communication in one place.',
      'Zentralisieren Sie Patientenprofile, Historie und Kommunikation an einem Ort.'
    ),
  },
  {
    kind: 'appointments',
    title: lt('Appointments', 'Termine'),
    body: lt(
      'Schedule, manage, and automate appointments with ease.',
      'Planen, verwalten und automatisieren Sie Termine mit Leichtigkeit.'
    ),
  },
  {
    kind: 'analytics',
    title: lt('Analytics & Reports', 'Analysen und Berichte'),
    body: lt(
      'Gain real-time insights and generate custom reports instantly.',
      'Gewinnen Sie Einblicke in Echtzeit und erstellen Sie sofort individuelle Berichte.'
    ),
  },
  {
    kind: 'records',
    title: lt('Secure Records', 'Sichere Akten'),
    body: lt(
      'Store and access medical records securely with role-based access.',
      'Speichern und öffnen Sie Krankenakten sicher mit rollenbasiertem Zugriff.'
    ),
  },
];

const scaleStats = [
  { kind: 'users', value: '12,450+', label: lt('Active Patients', 'Aktive Patienten') },
  { kind: 'buildings', value: '320+', label: lt('Clinics Supported', 'Unterstützte Kliniken') },
  { kind: 'reporting', value: '98,760+', label: lt('Reports Generated', 'Erstellte Berichte') },
  { kind: 'heart', value: '98.6%', label: lt('Satisfaction Rate', 'Zufriedenheitsrate') },
];

const solutionCards = [
  {
    kind: 'workflow',
    title: lt('Streamline Workflows', 'Workflows optimieren'),
    body: lt(
      'Automate routine tasks and reduce administrative burden.',
      'Automatisieren Sie Routineaufgaben und reduzieren Sie den Verwaltungsaufwand.'
    ),
  },
  {
    kind: 'visibility',
    title: lt('Improve Patient Visibility', 'Patiententransparenz verbessern'),
    body: lt(
      'Access complete patient information in real time.',
      'Greifen Sie in Echtzeit auf vollständige Patienteninformationen zu.'
    ),
  },
  {
    kind: 'reporting',
    title: lt('Faster Reporting', 'Schnellere Berichterstattung'),
    body: lt(
      'Generate accurate reports in just a few clicks.',
      'Erstellen Sie präzise Berichte mit nur wenigen Klicks.'
    ),
  },
  {
    kind: 'lock',
    title: lt('Secure Collaboration', 'Sichere Zusammenarbeit'),
    body: lt(
      'Work together safely with role-based permissions.',
      'Arbeiten Sie sicher zusammen mit rollenbasierten Berechtigungen.'
    ),
  },
];

const solutionChecklist = [
  lt('Unified patient, room, and appointment data', 'Vereinheitlichte Daten für Patienten, Zimmer und Termine'),
  lt('A clear handoff from public site to secure workspace', 'Ein klarer Übergang von der öffentlichen Website zum sicheren Arbeitsbereich'),
  lt('A modern look that still feels clinical and trusted', 'Ein moderner Auftritt, der weiterhin klinisch und vertrauenswürdig wirkt'),
];

const solutionStats = [
  { value: '42%', label: lt('less admin work', 'weniger Verwaltungsaufwand') },
  { value: '3.8x', label: lt('faster reporting', 'schnellere Berichterstattung') },
  { value: '24/7', label: lt('secure access', 'sicherer Zugriff') },
];

const footerColumns = [
  {
    title: lt('Product', 'Produkt'),
    items: [lt('Features', 'Funktionen'), lt('Dashboard', 'Dashboard'), lt('Pricing', 'Preise'), lt('Integrations', 'Integrationen')],
  },
  {
    title: lt('Solutions', 'Lösungen'),
    items: [lt('Clinics', 'Kliniken'), lt('Hospitals', 'Krankenhäuser'), lt('Medical Groups', 'Medizinische Gruppen'), lt('Telehealth', 'Telemedizin')],
  },
  {
    title: lt('Company', 'Unternehmen'),
    items: [lt('About Us', 'Über uns'), lt('Blog', 'Blog'), lt('Careers', 'Karriere'), lt('Contact', 'Kontakt')],
  },
  {
    title: lt('Resources', 'Ressourcen'),
    items: [lt('Help Center', 'Hilfecenter'), lt('Documentation', 'Dokumentation'), lt('Privacy Policy', 'Datenschutz'), lt('Terms of Service', 'Nutzungsbedingungen')],
  },
];

function LandingIcon({ kind, className = 'h-5 w-5 fill-none stroke-current stroke-[1.8]' }: { kind: string; className?: string }) {
  switch (kind) {
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 3 5 6v6c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-3Z" />
          <path d="m9.5 12 1.8 1.8 3.4-3.8" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 18h9a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 6 9.5 3.8 3.8 0 0 0 7 18Z" />
        </svg>
      );
    case 'bolt':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M13 3 6 13h5l-1 8 8-11h-5l1-7Z" />
        </svg>
      );
    case 'patients':
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="9" cy="9" r="3" />
          <circle cx="17" cy="10" r="2.5" />
          <path d="M3.5 19a6 6 0 0 1 11 0M14 19a4.8 4.8 0 0 1 6 0" />
        </svg>
      );
    case 'appointments':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" />
        </svg>
      );
    case 'analytics':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M5 19V9M12 19V5M19 19v-7" />
          <path d="M3 19h18" />
        </svg>
      );
    case 'records':
    case 'reporting':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M8 4h7l4 4v12H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" />
          <path d="M15 4v5h5M10 13h5M10 17h5" />
        </svg>
      );
    case 'workflow':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="5" width="6" height="6" rx="1.5" />
          <rect x="14" y="5" width="6" height="6" rx="1.5" />
          <rect x="9" y="14" width="6" height="6" rx="1.5" />
          <path d="M12 11v3" />
        </svg>
      );
    case 'visibility':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      );
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    case 'buildings':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 20V6a2 2 0 0 1 2-2h7v16M13 20V9a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v11M8 8h2M8 12h2M8 16h2M16 11h2M16 15h2" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m12 20-1.2-1.1C5.6 14.1 2 10.9 2 7.1A4.1 4.1 0 0 1 6.1 3 4.7 4.7 0 0 1 12 6.1 4.7 4.7 0 0 1 17.9 3 4.1 4.1 0 0 1 22 7.1c0 3.8-3.6 7-8.8 11.8L12 20Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="landing-page relative flex min-h-screen flex-col overflow-x-hidden px-3 pb-0 pt-3 md:px-5 md:pt-5">
      <div className="landing-noise pointer-events-none absolute inset-0" />
      <div className="landing-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="landing-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem]" />
      <div className="landing-orb bottom-[-12rem] right-[-7rem] h-[26rem] w-[26rem]" />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col">
        <header className="landing-shell animate-fade-up sticky top-3 z-40 rounded-[34px] px-5 py-4 md:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/45"
            >
              <img src="/medsphere-logo.png" alt="MedSphere" className="h-12 w-auto object-contain" />
              <div className="min-w-0">
                <p className="landing-display truncate text-2xl text-foreground">MedSphere</p>
                <p className="max-w-[23rem] truncate text-sm text-muted-foreground">{t(commonCopy.appSubtitle)}</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              {headerLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-primary/6 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
                >
                  {t(item.label)}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <ThemeToggle compact />
              <LanguageSwitch compact />
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
              >
                {t(lt('Log in', 'Anmelden'))}
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-5 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t(lt('Continue', 'Weiter'))}
              </Link>
            </div>
          </div>
        </header>

        <section id="dashboard" className="landing-shell mt-6 scroll-mt-28 rounded-[42px] px-5 py-6 md:px-7 md:py-8 xl:px-9 xl:py-9">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.02fr)] xl:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/6 px-4 py-2 text-sm font-semibold text-primary shadow-soft">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-beat" />
                {t(lt('All-in-one healthcare management platform', 'All-in-One-Plattform für Gesundheitsmanagement'))}
              </div>

              <div className="max-w-2xl">
                <h1 className="landing-display text-[clamp(3rem,6vw,6rem)] leading-[0.9] text-foreground">
                  {t(lt('Smarter healthcare', 'Intelligentere Gesundheitsversorgung'))}
                  <span className="block">
                    {t(lt('starts', 'beginnt'))} <span className="landing-highlight">{t(lt('here.', 'hier.'))}</span>
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
                  {t(
                    lt(
                      'MedSphere helps clinics, hospitals, and medical teams manage data, appointments, patients, and analytics in one secure platform.',
                      'MedSphere unterstützt Kliniken, Krankenhäuser und medizinische Teams dabei, Daten, Termine, Patienten und Analysen in einer sicheren Plattform zu verwalten.'
                    )
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-7 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t(lt('Start with login', 'Mit dem Login starten'))}
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-primary/20 bg-card/80 px-7 text-sm font-semibold text-primary shadow-soft transition hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t(lt('Explore features', 'Funktionen entdecken'))}
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trustSignals.map((item, index) => (
                  <article
                    key={item.title.en}
                    className="animate-fade-up rounded-[26px] border border-border/60 bg-white/80 p-4 shadow-soft"
                    style={{ animationDelay: `${140 + index * 120}ms` }}
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                      <LandingIcon kind={item.kind} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">{t(item.title)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(item.body)}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative xl:pl-2">
              <div className="landing-stage animate-fade-up p-4 md:p-5 [animation-delay:120ms] xl:ml-auto xl:max-w-[820px]">
                <div className="grid overflow-hidden rounded-[34px] border border-border/70 bg-white shadow-[0_34px_80px_hsl(var(--primary)/0.12)] xl:grid-cols-[164px_minmax(0,1fr)]">
                  <aside className="flex flex-col gap-4 bg-[linear-gradient(180deg,hsl(212_84%_27%),hsl(217_73%_18%))] px-3 py-4 text-white">
                    <div className="flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/10 px-3 py-3">
                      <img src="/medsphere.png" alt="" aria-hidden="true" className="h-9 w-9 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold uppercase tracking-[0.28em] text-white/70">MedSphere</p>
                        <p className="truncate text-sm text-white/90">{t(lt('Overview', 'Überblick'))}</p>
                      </div>
                    </div>

                    <nav className="space-y-2">
                      {dashboardMenu.map((item, index) => (
                        <div
                          key={item.en}
                          className={`flex items-center gap-2.5 rounded-[18px] px-3 py-2.5 text-sm ${
                            index === 0 ? 'bg-[linear-gradient(135deg,hsl(var(--accent)/0.42),hsl(var(--secondary)/0.28))] text-white shadow-soft' : 'text-white/72'
                          }`}
                        >
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${index === 0 ? 'bg-white/18' : 'bg-white/10'}`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-current" />
                          </span>
                          <span>{t(item)}</span>
                        </div>
                      ))}
                    </nav>

                    <div className="mt-auto rounded-[24px] border border-white/12 bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/68">
                        {t(lt('Secure records', 'Sichere Akten'))}
                      </p>
                      <p className="landing-display mt-3 text-3xl">100%</p>
                      <p className="mt-2 text-sm text-white/72">{t(lt('Protected and role-based', 'Geschützt und rollenbasiert'))}</p>
                    </div>
                  </aside>

                  <div className="space-y-4 p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                          {t(lt('Overview', 'Überblick'))}
                        </p>
                        <h2 className="landing-display mt-1 text-3xl text-foreground">
                          {t(lt('MedSphere dashboard', 'MedSphere-Dashboard'))}
                        </h2>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-muted-foreground lg:flex">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                            <circle cx="11" cy="11" r="6" />
                            <path d="m20 20-3.2-3.2" />
                          </svg>
                          {t(lt('Search patients, appointments...', 'Patienten, Termine ... suchen'))}
                        </div>
                        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-2 py-2 shadow-soft">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-sm font-bold text-white">
                            SJ
                          </span>
                          <div className="pr-2">
                            <p className="text-sm font-semibold text-foreground">Dr. Sarah Johnson</p>
                            <p className="text-xs text-muted-foreground">{t(lt('Administrator', 'Administrator'))}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                      {overviewStats.map((item, index) => (
                        <article
                          key={item.label.en}
                          className="animate-fade-up rounded-[24px] border border-border/60 bg-white p-4 shadow-soft"
                          style={{ animationDelay: `${220 + index * 100}ms` }}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {t(item.label)}
                          </p>
                          <p className="landing-display mt-3 break-words text-[clamp(2rem,3vw,3rem)] leading-none text-foreground">
                            {item.value}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-emerald-600">{item.delta}</p>
                        </article>
                      ))}
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[1.16fr_0.84fr]">
                      <article className="rounded-[28px] border border-border/60 bg-white p-4 shadow-soft">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{t(commonCopy.todayAppointments)}</p>
                          <a href="#pricing" className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            {t(lt('View all', 'Alle anzeigen'))}
                          </a>
                        </div>
                        <div className="mt-4 space-y-3">
                          {appointmentRows.map((item) => (
                            <div key={`${item.name}-${item.time}`} className="flex items-center gap-3 rounded-[20px] border border-border/50 bg-background/55 px-3 py-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {item.name
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 2)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{t(item.detail)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-foreground">{item.time}</p>
                                <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tone}`}>
                                  {t(item.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>

                      <div className="grid content-start gap-3">
                        <article className="rounded-[28px] border border-border/60 bg-white p-4 shadow-soft">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">
                              {t(lt('Health Analytics', 'Gesundheitsanalysen'))}
                            </p>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                              {t(lt('This month', 'Diesen Monat'))}
                            </span>
                          </div>

                          <div className="mt-4 rounded-[24px] border border-border/50 bg-background/60 p-3">
                            <svg viewBox="0 0 360 180" className="h-44 w-full">
                              <path d="M24 152H336" stroke="hsl(var(--border))" strokeWidth="1" />
                              <path d="M24 110H336" stroke="hsl(var(--border))" strokeWidth="1" />
                              <path d="M24 68H336" stroke="hsl(var(--border))" strokeWidth="1" />
                              <path
                                d="M24 136C48 128 58 110 82 110C106 110 112 133 136 133C160 133 170 88 194 88C218 88 226 118 250 118C274 118 282 63 306 63C320 63 330 74 336 82"
                                fill="none"
                                stroke="url(#medsphere-chart)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <defs>
                                <linearGradient id="medsphere-chart" x1="24" x2="336" y1="0" y2="0">
                                  <stop offset="0%" stopColor="hsl(var(--secondary))" />
                                  <stop offset="54%" stopColor="hsl(var(--accent))" />
                                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </article>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            {
                              title: lt('Doctor Activity', 'Aktivität der Ärzte'),
                              value: '78%',
                              note: '+6.2%',
                              icon: 'analytics',
                            },
                            {
                              title: lt('Active Treatments', 'Aktive Behandlungen'),
                              value: '1,104',
                              note: '+9.1%',
                              icon: 'records',
                            },
                          ].map((item) => (
                            <article key={item.title.en} className="rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                                <LandingIcon kind={item.icon} />
                              </div>
                              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {t(item.title)}
                              </p>
                              <p className="landing-display mt-2 text-[2rem] leading-none text-foreground">{item.value}</p>
                              <p className="mt-2 text-sm font-semibold text-emerald-600">{item.note}</p>
                            </article>
                          ))}
                        </div>

                        <article className="rounded-[22px] border border-border/60 bg-white p-4 shadow-soft">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                              <LandingIcon kind="appointments" />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {t(lt('Upcoming Appointments', 'Bevorstehende Termine'))}
                              </p>
                              <p className="landing-display mt-2 text-[2rem] leading-none text-foreground">32</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-emerald-600">{t(lt('Today', 'Heute'))}</p>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-float-slow absolute -right-2 top-12 hidden rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-soft 2xl:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t(lt('Platform uptime', 'Plattform-Verfügbarkeit'))}
                </p>
                <p className="landing-display mt-2 text-3xl text-foreground">99.98%</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(lt('Across clinics and hospitals', 'Über Kliniken und Krankenhäuser hinweg'))}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-8 grid scroll-mt-28 gap-4 xl:grid-cols-4">
          {featureCards.map((item, index) => (
            <article
              key={item.title.en}
              className="landing-shell animate-fade-up rounded-[30px] p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/25"
              style={{ animationDelay: `${160 + index * 90}ms` }}
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.18))] text-primary">
                <LandingIcon kind={item.kind} className="h-6 w-6 fill-none stroke-current stroke-[1.8]" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{t(item.title)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.body)}</p>
            </article>
          ))}
        </section>

        <section className="landing-shell mt-6 rounded-[34px] px-5 py-5 md:px-7">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))] xl:items-center">
            <div className="pr-0 xl:pr-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {t(lt('Trusted by care teams', 'Vertraut von Betreuungsteams'))}
              </p>
              <h2 className="landing-display mt-2 text-[2rem] leading-tight text-foreground">
                {t(lt('Built to support better care at scale.', 'Entwickelt, um bessere Versorgung im großen Maßstab zu unterstützen.'))}
              </h2>
            </div>

            {scaleStats.map((item) => (
              <article key={item.label.en} className="rounded-[24px] border border-border/60 bg-white/80 px-4 py-4 shadow-soft xl:border-l xl:border-r-0 xl:border-t-0 xl:border-b-0 xl:rounded-none xl:bg-transparent xl:px-6 xl:shadow-none">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <LandingIcon kind={item.kind} />
                </div>
                <p className="landing-display mt-4 text-3xl text-foreground">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(item.label)}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="solutions" className="mt-8 grid items-start scroll-mt-28 gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="grid self-start content-start gap-4">
            <article className="landing-shell rounded-[36px] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {t(lt('How MedSphere helps', 'Wie MedSphere hilft'))}
              </p>
              <h2 className="landing-display mt-3 text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.94] text-foreground">
                {t(lt('Better care. Smarter operations.', 'Bessere Versorgung. Intelligentere Abläufe.'))}
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {t(
                  lt(
                    'From the guest-facing first impression to daily staff workflows, MedSphere keeps the experience calm, trustworthy, and operationally useful.',
                    'Vom ersten öffentlichen Eindruck bis zu den täglichen Arbeitsabläufen des Teams hält MedSphere das Erlebnis ruhig, vertrauenswürdig und praktisch.'
                  )
                )}
              </p>
            </article>

            <article className="landing-shell relative overflow-hidden rounded-[34px] p-6 shadow-soft">
              <div className="landing-orb left-[-6rem] top-[-6rem] h-40 w-40 opacity-60" />
              <div className="relative z-10">
                <img src="/medsphere-logo.png" alt="MedSphere" className="h-16 w-auto object-contain" />
                <div className="mt-6 grid gap-3">
                  {solutionChecklist.map((item) => (
                    <div key={item.en} className="flex items-start gap-3 rounded-[20px] border border-border/60 bg-white/80 px-4 py-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary/18 text-secondary">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                          <path d="m5 12 4 4 10-10" />
                        </svg>
                      </span>
                      <p className="text-sm text-foreground">{t(item)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="grid self-start content-start gap-4 md:grid-cols-2">
            {solutionCards.map((item, index) => (
              <article
                key={item.title.en}
                className="landing-shell animate-fade-up self-start rounded-[30px] p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/25"
                style={{ animationDelay: `${180 + index * 100}ms` }}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.18))] text-primary">
                  <LandingIcon kind={item.kind} className="h-6 w-6 fill-none stroke-current stroke-[1.8]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{t(item.title)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.body)}</p>
              </article>
            ))}

            <article className="landing-shell col-span-full rounded-[30px] p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_repeat(3,minmax(0,0.6fr))] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    {t(lt('Operational impact', 'Operative Wirkung'))}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {t(lt('Less waiting between every care step.', 'Weniger Wartezeit zwischen jedem Versorgungsschritt.'))}
                  </h3>
                </div>

                {solutionStats.map((item) => (
                  <div key={item.value} className="rounded-[22px] border border-border/60 bg-white/80 p-4">
                    <p className="landing-display text-3xl leading-none text-foreground">{item.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{t(item.label)}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section
          id="pricing"
          className="mt-8 !mb-8 scroll-mt-28 overflow-hidden rounded-[36px] border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-6 py-6 text-white shadow-[0_28px_70px_hsl(var(--primary)/0.22)] md:px-8"
        >
          <div className="grid gap-5 xl:grid-cols-[1.1fr_auto] xl:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
                {t(lt('Ready to transform your healthcare operations?', 'Gati te transformoni operacionet e kujdesit?'))}
              </p>
              <h2 className="landing-display mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[0.96]">
                {t(lt('Bring the same clarity from first visit to daily care delivery.', 'Sillni te njejten qartesi nga vizita e pare te kujdesi i perditshem.'))}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                {t(
                  lt(
                    'Join healthcare providers using MedSphere to manage patients, rooms, teams, and reporting with one connected system.',
                    'Bashkohuni me ofruesit e kujdesit qe perdorin MedSphere per paciente, dhoma, ekipe dhe raporte ne nje sistem te lidhur.'
                  )
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-primary shadow-soft transition hover:translate-y-[-1px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {t(lt('Log in to continue', 'Hyni per te vazhduar'))}
              </Link>
              <a
                href="#page-end"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {t(lt('Talk to MedSphere', 'Flisni me MedSphere'))}
              </a>
            </div>
          </div>
        </section>

        <footer id="contact" className="mt-5 landing-shell mt-auto scroll-mt-28 rounded-[34px] px-6 py-6 md:px-8 md:py-7">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_repeat(4,minmax(0,1fr))]">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/medsphere-logo.png" alt="MedSphere" className="h-14 w-auto object-contain" />
                <div>
                  <p className="landing-display text-2xl text-foreground">MedSphere</p>
                  <p className="max-w-[16rem] text-sm leading-7 text-muted-foreground">
                    {t(lt('Empowering healthcare organizations with technology that feels trustworthy and modern.', 'Fuqizojme organizatat shendetesore me teknologji moderne dhe te besueshme.'))}
                  </p>
                </div>
              </Link>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title.en}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">{t(column.title)}</p>
                <div className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  {column.items.map((item) => (
                    <p key={item.en}>{t(item)}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>{t(lt('hello@medsphere.com', 'hello@medsphere.com'))}</p>
            <p>{t(lt('(888) 123-4567', '(888) 123-4567'))}</p>
            <p>{t(lt('© 2026 MedSphere. All rights reserved.', '© 2026 MedSphere. Te gjitha te drejtat e rezervuara.'))}</p>
          </div>
        </footer>
        <div id="page-end" className="h-px scroll-mt-[100vh]" aria-hidden="true" />
      </div>
    </main>
  );
}
