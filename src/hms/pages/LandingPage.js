import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        body: lt('Centralize patient profiles, history, and communication in one place.', 'Zentralisieren Sie Patientenprofile, Historie und Kommunikation an einem Ort.'),
    },
    {
        kind: 'appointments',
        title: lt('Appointments', 'Termine'),
        body: lt('Schedule, manage, and automate appointments with ease.', 'Planen, verwalten und automatisieren Sie Termine mit Leichtigkeit.'),
    },
    {
        kind: 'analytics',
        title: lt('Analytics & Reports', 'Analysen und Berichte'),
        body: lt('Gain real-time insights and generate custom reports instantly.', 'Gewinnen Sie Einblicke in Echtzeit und erstellen Sie sofort individuelle Berichte.'),
    },
    {
        kind: 'records',
        title: lt('Secure Records', 'Sichere Akten'),
        body: lt('Store and access medical records securely with role-based access.', 'Speichern und öffnen Sie Krankenakten sicher mit rollenbasiertem Zugriff.'),
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
        body: lt('Automate routine tasks and reduce administrative burden.', 'Automatisieren Sie Routineaufgaben und reduzieren Sie den Verwaltungsaufwand.'),
    },
    {
        kind: 'visibility',
        title: lt('Improve Patient Visibility', 'Patiententransparenz verbessern'),
        body: lt('Access complete patient information in real time.', 'Greifen Sie in Echtzeit auf vollständige Patienteninformationen zu.'),
    },
    {
        kind: 'reporting',
        title: lt('Faster Reporting', 'Schnellere Berichterstattung'),
        body: lt('Generate accurate reports in just a few clicks.', 'Erstellen Sie präzise Berichte mit nur wenigen Klicks.'),
    },
    {
        kind: 'lock',
        title: lt('Secure Collaboration', 'Sichere Zusammenarbeit'),
        body: lt('Work together safely with role-based permissions.', 'Arbeiten Sie sicher zusammen mit rollenbasierten Berechtigungen.'),
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
function LandingIcon({ kind, className = 'h-5 w-5 fill-none stroke-current stroke-[1.8]' }) {
    switch (kind) {
        case 'shield':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("path", { d: "M12 3 5 6v6c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-3Z" }), _jsx("path", { d: "m9.5 12 1.8 1.8 3.4-3.8" })] }));
        case 'cloud':
            return (_jsx("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: _jsx("path", { d: "M7 18h9a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 6 9.5 3.8 3.8 0 0 0 7 18Z" }) }));
        case 'bolt':
            return (_jsx("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: _jsx("path", { d: "M13 3 6 13h5l-1 8 8-11h-5l1-7Z" }) }));
        case 'patients':
        case 'users':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("circle", { cx: "9", cy: "9", r: "3" }), _jsx("circle", { cx: "17", cy: "10", r: "2.5" }), _jsx("path", { d: "M3.5 19a6 6 0 0 1 11 0M14 19a4.8 4.8 0 0 1 6 0" })] }));
        case 'appointments':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("rect", { x: "4", y: "5", width: "16", height: "15", rx: "3" }), _jsx("path", { d: "M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" })] }));
        case 'analytics':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("path", { d: "M5 19V9M12 19V5M19 19v-7" }), _jsx("path", { d: "M3 19h18" })] }));
        case 'records':
        case 'reporting':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("path", { d: "M8 4h7l4 4v12H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" }), _jsx("path", { d: "M15 4v5h5M10 13h5M10 17h5" })] }));
        case 'workflow':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("rect", { x: "4", y: "5", width: "6", height: "6", rx: "1.5" }), _jsx("rect", { x: "14", y: "5", width: "6", height: "6", rx: "1.5" }), _jsx("rect", { x: "9", y: "14", width: "6", height: "6", rx: "1.5" }), _jsx("path", { d: "M12 11v3" })] }));
        case 'visibility':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }), _jsx("circle", { cx: "12", cy: "12", r: "2.8" })] }));
        case 'lock':
            return (_jsxs("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: [_jsx("rect", { x: "5", y: "11", width: "14", height: "9", rx: "2" }), _jsx("path", { d: "M8 11V8a4 4 0 1 1 8 0v3" })] }));
        case 'buildings':
            return (_jsx("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: _jsx("path", { d: "M4 20V6a2 2 0 0 1 2-2h7v16M13 20V9a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v11M8 8h2M8 12h2M8 16h2M16 11h2M16 15h2" }) }));
        case 'heart':
            return (_jsx("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: _jsx("path", { d: "m12 20-1.2-1.1C5.6 14.1 2 10.9 2 7.1A4.1 4.1 0 0 1 6.1 3 4.7 4.7 0 0 1 12 6.1 4.7 4.7 0 0 1 17.9 3 4.1 4.1 0 0 1 22 7.1c0 3.8-3.6 7-8.8 11.8L12 20Z" }) }));
        default:
            return (_jsx("svg", { viewBox: "0 0 24 24", className: className, "aria-hidden": "true", children: _jsx("circle", { cx: "12", cy: "12", r: "8" }) }));
    }
}
export default function LandingPage() {
    const { t } = useLanguage();
    return (_jsxs("main", { className: "landing-page relative flex min-h-screen flex-col overflow-x-hidden px-3 pb-0 pt-3 md:px-5 md:pt-5", children: [_jsx("div", { className: "landing-noise pointer-events-none absolute inset-0" }), _jsx("div", { className: "landing-mesh pointer-events-none absolute inset-0 opacity-70" }), _jsx("div", { className: "landing-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem]" }), _jsx("div", { className: "landing-orb bottom-[-12rem] right-[-7rem] h-[26rem] w-[26rem]" }), _jsxs("div", { className: "relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col", children: [_jsx("header", { className: "landing-shell animate-fade-up sticky top-3 z-40 rounded-[34px] px-5 py-4 md:px-7", children: _jsxs("div", { className: "flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/45", children: [_jsx("img", { src: "/medsphere-logo.png", alt: "MedSphere", className: "h-12 w-auto object-contain" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "landing-display truncate text-2xl text-foreground", children: "MedSphere" }), _jsx("p", { className: "max-w-[23rem] truncate text-sm text-muted-foreground", children: t(commonCopy.appSubtitle) })] })] }), _jsx("nav", { className: "hidden items-center gap-1 xl:flex", children: headerLinks.map((item) => (_jsx("a", { href: item.href, className: "rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-primary/6 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45", children: t(item.label) }, item.href))) }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 xl:justify-end", children: [_jsx(ThemeToggle, { compact: true }), _jsx(LanguageSwitch, { compact: true }), _jsx(Link, { to: "/login", className: "inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45", children: t(lt('Log in', 'Anmelden')) }), _jsx(Link, { to: "/login", className: "inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-5 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background", children: t(lt('Continue', 'Weiter')) })] })] }) }), _jsx("section", { id: "dashboard", className: "landing-shell mt-6 scroll-mt-28 rounded-[42px] px-5 py-6 md:px-7 md:py-8 xl:px-9 xl:py-9", children: _jsxs("div", { className: "grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.02fr)] xl:items-center", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/6 px-4 py-2 text-sm font-semibold text-primary shadow-soft", children: [_jsx("span", { className: "inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-beat" }), t(lt('All-in-one healthcare management platform', 'All-in-One-Plattform für Gesundheitsmanagement'))] }), _jsxs("div", { className: "max-w-2xl", children: [_jsxs("h1", { className: "landing-display text-[clamp(3rem,6vw,6rem)] leading-[0.9] text-foreground", children: [t(lt('Smarter healthcare', 'Intelligentere Gesundheitsversorgung')), _jsxs("span", { className: "block", children: [t(lt('starts', 'beginnt')), " ", _jsx("span", { className: "landing-highlight", children: t(lt('here.', 'hier.')) })] })] }), _jsx("p", { className: "mt-5 max-w-xl text-base leading-8 text-muted-foreground md:text-lg", children: t(lt('MedSphere helps clinics, hospitals, and medical teams manage data, appointments, patients, and analytics in one secure platform.', 'MedSphere unterstützt Kliniken, Krankenhäuser und medizinische Teams dabei, Daten, Termine, Patienten und Analysen in einer sicheren Plattform zu verwalten.')) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsx(Link, { to: "/login", className: "inline-flex h-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-7 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background", children: t(lt('Start with login', 'Mit dem Login starten')) }), _jsx("a", { href: "#features", className: "inline-flex h-14 items-center justify-center rounded-full border border-primary/20 bg-card/80 px-7 text-sm font-semibold text-primary shadow-soft transition hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background", children: t(lt('Explore features', 'Funktionen entdecken')) })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: trustSignals.map((item, index) => (_jsxs("article", { className: "animate-fade-up rounded-[26px] border border-border/60 bg-white/80 p-4 shadow-soft", style: { animationDelay: `${140 + index * 120}ms` }, children: [_jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: item.kind }) }), _jsx("p", { className: "mt-4 text-sm font-semibold text-foreground", children: t(item.title) }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t(item.body) })] }, item.title.en))) })] }), _jsxs("div", { className: "relative xl:pl-2", children: [_jsx("div", { className: "landing-stage animate-fade-up p-4 md:p-5 [animation-delay:120ms] xl:ml-auto xl:max-w-[820px]", children: _jsxs("div", { className: "grid overflow-hidden rounded-[34px] border border-border/70 bg-white shadow-[0_34px_80px_hsl(var(--primary)/0.12)] xl:grid-cols-[164px_minmax(0,1fr)]", children: [_jsxs("aside", { className: "flex flex-col gap-4 bg-[linear-gradient(180deg,hsl(212_84%_27%),hsl(217_73%_18%))] px-3 py-4 text-white", children: [_jsxs("div", { className: "flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/10 px-3 py-3", children: [_jsx("img", { src: "/medsphere.png", alt: "", "aria-hidden": "true", className: "h-9 w-9 rounded-xl object-cover" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-xs font-semibold uppercase tracking-[0.28em] text-white/70", children: "MedSphere" }), _jsx("p", { className: "truncate text-sm text-white/90", children: t(lt('Overview', 'Überblick')) })] })] }), _jsx("nav", { className: "space-y-2", children: dashboardMenu.map((item, index) => (_jsxs("div", { className: `flex items-center gap-2.5 rounded-[18px] px-3 py-2.5 text-sm ${index === 0 ? 'bg-[linear-gradient(135deg,hsl(var(--accent)/0.42),hsl(var(--secondary)/0.28))] text-white shadow-soft' : 'text-white/72'}`, children: [_jsx("span", { className: `inline-flex h-8 w-8 items-center justify-center rounded-xl ${index === 0 ? 'bg-white/18' : 'bg-white/10'}`, children: _jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-current" }) }), _jsx("span", { children: t(item) })] }, item.en))) }), _jsxs("div", { className: "mt-auto rounded-[24px] border border-white/12 bg-white/10 p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-white/68", children: t(lt('Secure records', 'Sichere Akten')) }), _jsx("p", { className: "landing-display mt-3 text-3xl", children: "100%" }), _jsx("p", { className: "mt-2 text-sm text-white/72", children: t(lt('Protected and role-based', 'Geschützt und rollenbasiert')) })] })] }), _jsxs("div", { className: "space-y-4 p-4 md:p-5", children: [_jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-primary", children: t(lt('Overview', 'Überblick')) }), _jsx("h2", { className: "landing-display mt-1 text-3xl text-foreground", children: t(lt('MedSphere dashboard', 'MedSphere-Dashboard')) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "hidden items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-muted-foreground lg:flex", children: [_jsxs("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[1.8]", children: [_jsx("circle", { cx: "11", cy: "11", r: "6" }), _jsx("path", { d: "m20 20-3.2-3.2" })] }), t(lt('Search patients, appointments...', 'Patienten, Termine ... suchen'))] }), _jsxs("div", { className: "flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-2 py-2 shadow-soft", children: [_jsx("span", { className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-sm font-bold text-white", children: "SJ" }), _jsxs("div", { className: "pr-2", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Dr. Sarah Johnson" }), _jsx("p", { className: "text-xs text-muted-foreground", children: t(lt('Administrator', 'Administrator')) })] })] })] })] }), _jsx("div", { className: "grid gap-3 md:grid-cols-2 2xl:grid-cols-4", children: overviewStats.map((item, index) => (_jsxs("article", { className: "animate-fade-up rounded-[24px] border border-border/60 bg-white p-4 shadow-soft", style: { animationDelay: `${220 + index * 100}ms` }, children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(item.label) }), _jsx("p", { className: "landing-display mt-3 break-words text-[clamp(2rem,3vw,3rem)] leading-none text-foreground", children: item.value }), _jsx("p", { className: "mt-2 text-sm font-semibold text-emerald-600", children: item.delta })] }, item.label.en))) }), _jsxs("div", { className: "grid gap-3 xl:grid-cols-[1.16fr_0.84fr]", children: [_jsxs("article", { className: "rounded-[28px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t(commonCopy.todayAppointments) }), _jsx("a", { href: "#pricing", className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: t(lt('View all', 'Alle anzeigen')) })] }), _jsx("div", { className: "mt-4 space-y-3", children: appointmentRows.map((item) => (_jsxs("div", { className: "flex items-center gap-3 rounded-[20px] border border-border/50 bg-background/55 px-3 py-3", children: [_jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: item.name
                                                                                                .split(' ')
                                                                                                .map((part) => part[0])
                                                                                                .join('')
                                                                                                .slice(0, 2) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-semibold text-foreground", children: item.name }), _jsx("p", { className: "truncate text-xs text-muted-foreground", children: t(item.detail) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs font-semibold text-foreground", children: item.time }), _jsx("span", { className: `mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tone}`, children: t(item.status) })] })] }, `${item.name}-${item.time}`))) })] }), _jsxs("div", { className: "grid content-start gap-3", children: [_jsxs("article", { className: "rounded-[28px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t(lt('Health Analytics', 'Gesundheitsanalysen')) }), _jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: t(lt('This month', 'Diesen Monat')) })] }), _jsx("div", { className: "mt-4 rounded-[24px] border border-border/50 bg-background/60 p-3", children: _jsxs("svg", { viewBox: "0 0 360 180", className: "h-44 w-full", children: [_jsx("path", { d: "M24 152H336", stroke: "hsl(var(--border))", strokeWidth: "1" }), _jsx("path", { d: "M24 110H336", stroke: "hsl(var(--border))", strokeWidth: "1" }), _jsx("path", { d: "M24 68H336", stroke: "hsl(var(--border))", strokeWidth: "1" }), _jsx("path", { d: "M24 136C48 128 58 110 82 110C106 110 112 133 136 133C160 133 170 88 194 88C218 88 226 118 250 118C274 118 282 63 306 63C320 63 330 74 336 82", fill: "none", stroke: "url(#medsphere-chart)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("defs", { children: _jsxs("linearGradient", { id: "medsphere-chart", x1: "24", x2: "336", y1: "0", y2: "0", children: [_jsx("stop", { offset: "0%", stopColor: "hsl(var(--secondary))" }), _jsx("stop", { offset: "54%", stopColor: "hsl(var(--accent))" }), _jsx("stop", { offset: "100%", stopColor: "hsl(var(--primary))" })] }) })] }) })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: [
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
                                                                                ].map((item) => (_jsxs("article", { className: "rounded-[22px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: item.icon }) }), _jsx("p", { className: "mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(item.title) }), _jsx("p", { className: "landing-display mt-2 text-[2rem] leading-none text-foreground", children: item.value }), _jsx("p", { className: "mt-2 text-sm font-semibold text-emerald-600", children: item.note })] }, item.title.en))) }), _jsxs("article", { className: "rounded-[22px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: "appointments" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(lt('Upcoming Appointments', 'Bevorstehende Termine')) }), _jsx("p", { className: "landing-display mt-2 text-[2rem] leading-none text-foreground", children: "32" })] })] }), _jsx("p", { className: "mt-2 text-sm font-semibold text-emerald-600", children: t(lt('Today', 'Heute')) })] })] })] })] })] }) }), _jsxs("div", { className: "animate-float-slow absolute -right-2 top-12 hidden rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-soft 2xl:block", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-primary", children: t(lt('Platform uptime', 'Plattform-Verfügbarkeit')) }), _jsx("p", { className: "landing-display mt-2 text-3xl text-foreground", children: "99.98%" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t(lt('Across clinics and hospitals', 'Über Kliniken und Krankenhäuser hinweg')) })] })] })] }) }), _jsx("section", { id: "features", className: "mt-8 grid scroll-mt-28 gap-4 xl:grid-cols-4", children: featureCards.map((item, index) => (_jsxs("article", { className: "landing-shell animate-fade-up rounded-[30px] p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/25", style: { animationDelay: `${160 + index * 90}ms` }, children: [_jsx("div", { className: "inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.18))] text-primary", children: _jsx(LandingIcon, { kind: item.kind, className: "h-6 w-6 fill-none stroke-current stroke-[1.8]" }) }), _jsx("h3", { className: "mt-5 text-xl font-semibold text-foreground", children: t(item.title) }), _jsx("p", { className: "mt-3 text-sm leading-7 text-muted-foreground", children: t(item.body) })] }, item.title.en))) }), _jsx("section", { className: "landing-shell mt-6 rounded-[34px] px-5 py-5 md:px-7", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))] xl:items-center", children: [_jsxs("div", { className: "pr-0 xl:pr-6", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-primary", children: t(lt('Trusted by care teams', 'Vertraut von Betreuungsteams')) }), _jsx("h2", { className: "landing-display mt-2 text-[2rem] leading-tight text-foreground", children: t(lt('Built to support better care at scale.', 'Entwickelt, um bessere Versorgung im großen Maßstab zu unterstützen.')) })] }), scaleStats.map((item) => (_jsxs("article", { className: "rounded-[24px] border border-border/60 bg-white/80 px-4 py-4 shadow-soft xl:border-l xl:border-r-0 xl:border-t-0 xl:border-b-0 xl:rounded-none xl:bg-transparent xl:px-6 xl:shadow-none", children: [_jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: item.kind }) }), _jsx("p", { className: "landing-display mt-4 text-3xl text-foreground", children: item.value }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t(item.label) })] }, item.label.en)))] }) }), _jsxs("section", { id: "solutions", className: "mt-8 grid items-start scroll-mt-28 gap-6 xl:grid-cols-[0.72fr_1.28fr]", children: [_jsxs("div", { className: "grid self-start content-start gap-4", children: [_jsxs("article", { className: "landing-shell rounded-[36px] p-6 md:p-8", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-primary", children: t(lt('How MedSphere helps', 'Wie MedSphere hilft')) }), _jsx("h2", { className: "landing-display mt-3 text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.94] text-foreground", children: t(lt('Better care. Smarter operations.', 'Bessere Versorgung. Intelligentere Abläufe.')) }), _jsx("p", { className: "mt-4 text-base leading-8 text-muted-foreground", children: t(lt('From the guest-facing first impression to daily staff workflows, MedSphere keeps the experience calm, trustworthy, and operationally useful.', 'Vom ersten öffentlichen Eindruck bis zu den täglichen Arbeitsabläufen des Teams hält MedSphere das Erlebnis ruhig, vertrauenswürdig und praktisch.')) })] }), _jsxs("article", { className: "landing-shell relative overflow-hidden rounded-[34px] p-6 shadow-soft", children: [_jsx("div", { className: "landing-orb left-[-6rem] top-[-6rem] h-40 w-40 opacity-60" }), _jsxs("div", { className: "relative z-10", children: [_jsx("img", { src: "/medsphere-logo.png", alt: "MedSphere", className: "h-16 w-auto object-contain" }), _jsx("div", { className: "mt-6 grid gap-3", children: solutionChecklist.map((item) => (_jsxs("div", { className: "flex items-start gap-3 rounded-[20px] border border-border/60 bg-white/80 px-4 py-3", children: [_jsx("span", { className: "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary/18 text-secondary", children: _jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[2]", children: _jsx("path", { d: "m5 12 4 4 10-10" }) }) }), _jsx("p", { className: "text-sm text-foreground", children: t(item) })] }, item.en))) })] })] })] }), _jsxs("div", { className: "grid self-start content-start gap-4 md:grid-cols-2", children: [solutionCards.map((item, index) => (_jsxs("article", { className: "landing-shell animate-fade-up self-start rounded-[30px] p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/25", style: { animationDelay: `${180 + index * 100}ms` }, children: [_jsx("div", { className: "inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.18))] text-primary", children: _jsx(LandingIcon, { kind: item.kind, className: "h-6 w-6 fill-none stroke-current stroke-[1.8]" }) }), _jsx("h3", { className: "mt-5 text-xl font-semibold text-foreground", children: t(item.title) }), _jsx("p", { className: "mt-3 text-sm leading-7 text-muted-foreground", children: t(item.body) })] }, item.title.en))), _jsx("article", { className: "landing-shell col-span-full rounded-[30px] p-5 md:p-6", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_repeat(3,minmax(0,0.6fr))] md:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-primary", children: t(lt('Operational impact', 'Operative Wirkung')) }), _jsx("h3", { className: "mt-2 text-xl font-semibold text-foreground", children: t(lt('Less waiting between every care step.', 'Weniger Wartezeit zwischen jedem Versorgungsschritt.')) })] }), solutionStats.map((item) => (_jsxs("div", { className: "rounded-[22px] border border-border/60 bg-white/80 p-4", children: [_jsx("p", { className: "landing-display text-3xl leading-none text-foreground", children: item.value }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t(item.label) })] }, item.value)))] }) })] })] }), _jsx("section", { id: "pricing", className: "mt-8 !mb-8 scroll-mt-28 overflow-hidden rounded-[36px] border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-6 py-6 text-white shadow-[0_28px_70px_hsl(var(--primary)/0.22)] md:px-8", children: _jsxs("div", { className: "grid gap-5 xl:grid-cols-[1.1fr_auto] xl:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-white/72", children: t(lt('Ready to transform your healthcare operations?', 'Gati te transformoni operacionet e kujdesit?')) }), _jsx("h2", { className: "landing-display mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[0.96]", children: t(lt('Bring the same clarity from first visit to daily care delivery.', 'Sillni te njejten qartesi nga vizita e pare te kujdesi i perditshem.')) }), _jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-white/78 md:text-base", children: t(lt('Join healthcare providers using MedSphere to manage patients, rooms, teams, and reporting with one connected system.', 'Bashkohuni me ofruesit e kujdesit qe perdorin MedSphere per paciente, dhoma, ekipe dhe raporte ne nje sistem te lidhur.')) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row xl:justify-end", children: [_jsx(Link, { to: "/login", className: "inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-primary shadow-soft transition hover:translate-y-[-1px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80", children: t(lt('Log in to continue', 'Hyni per te vazhduar')) }), _jsx("a", { href: "#page-end", className: "inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80", children: t(lt('Talk to MedSphere', 'Flisni me MedSphere')) })] })] }) }), _jsxs("footer", { id: "contact", className: "mt-5 landing-shell mt-auto scroll-mt-28 rounded-[34px] px-6 py-6 md:px-8 md:py-7", children: [_jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.95fr_repeat(4,minmax(0,1fr))]", children: [_jsx("div", { children: _jsxs(Link, { to: "/", className: "inline-flex items-center gap-3", children: [_jsx("img", { src: "/medsphere-logo.png", alt: "MedSphere", className: "h-14 w-auto object-contain" }), _jsxs("div", { children: [_jsx("p", { className: "landing-display text-2xl text-foreground", children: "MedSphere" }), _jsx("p", { className: "max-w-[16rem] text-sm leading-7 text-muted-foreground", children: t(lt('Empowering healthcare organizations with technology that feels trustworthy and modern.', 'Fuqizojme organizatat shendetesore me teknologji moderne dhe te besueshme.')) })] })] }) }), footerColumns.map((column) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: t(column.title) }), _jsx("div", { className: "mt-3 space-y-2.5 text-sm text-muted-foreground", children: column.items.map((item) => (_jsx("p", { children: t(item) }, item.en))) })] }, column.title.en)))] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between", children: [_jsx("p", { children: t(lt('hello@medsphere.com', 'hello@medsphere.com')) }), _jsx("p", { children: t(lt('(888) 123-4567', '(888) 123-4567')) }), _jsx("p", { children: t(lt('© 2026 MedSphere. All rights reserved.', '© 2026 MedSphere. Te gjitha te drejtat e rezervuara.')) })] })] }), _jsx("div", { id: "page-end", className: "h-px scroll-mt-[100vh]", "aria-hidden": "true" })] })] }));
}
