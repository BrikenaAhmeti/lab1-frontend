import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy, lt } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
const headerLinks = [
    { href: '#features', label: lt('Features', 'Karakteristikat') },
    { href: '#dashboard', label: lt('Dashboard', 'Paneli') },
    { href: '#solutions', label: lt('Solutions', 'Zgjidhjet') },
    { href: '#pricing', label: lt('Pricing', 'Cmimet') },
    { href: '#page-end', label: lt('Contact', 'Kontakti') },
];
const dashboardMenu = [
    lt('Overview', 'Permbledhje'),
    lt('Patients', 'Pacientet'),
    lt('Appointments', 'Terminet'),
    lt('Analytics', 'Analitika'),
    lt('Records', 'Kartelat'),
];
const overviewStats = [
    { label: lt('Active Patients', 'Pacientet aktive'), value: '2,543', delta: '+12.5%' },
    { label: lt("Today's Appointments", 'Terminet e sotme'), value: '32', delta: '+8.2%' },
    { label: lt('Treatments', 'Trajtimet'), value: '1,280', delta: '+15.3%' },
    { label: lt('Revenue', 'Te ardhurat'), value: '$128,540', delta: '+10.7%' },
];
const appointmentRows = [
    {
        name: 'John Smith',
        detail: lt('General checkup', 'Kontroll i pergjithshem'),
        time: '9:00 AM',
        status: lt('Confirmed', 'Konfirmuar'),
        tone: 'bg-emerald-500/12 text-emerald-700',
    },
    {
        name: 'Emily Davis',
        detail: lt('Cardiology follow-up', 'Kontroll kardiologjik'),
        time: '10:30 AM',
        status: lt('Confirmed', 'Konfirmuar'),
        tone: 'bg-sky-500/12 text-sky-700',
    },
    {
        name: 'Michael Brown',
        detail: lt('Lab test', 'Test laboratorik'),
        time: '11:15 AM',
        status: lt('Pending', 'Ne pritje'),
        tone: 'bg-amber-500/14 text-amber-700',
    },
    {
        name: 'Sarah Wilson',
        detail: lt('Consultation', 'Konsulte'),
        time: '1:30 PM',
        status: lt('Pending', 'Ne pritje'),
        tone: 'bg-amber-500/14 text-amber-700',
    },
];
const trustSignals = [
    {
        kind: 'shield',
        title: lt('HIPAA compliant', 'Ne perputhje me HIPAA'),
        body: lt('Your data is always secure', 'Te dhenat jane gjithmone te sigurta'),
    },
    {
        kind: 'cloud',
        title: lt('Cloud based', 'I bazuar ne cloud'),
        body: lt('Access anywhere, anytime', 'Qasje kudo dhe ne cdo kohe'),
    },
    {
        kind: 'bolt',
        title: lt('Real-time insights', 'Pasqyra ne kohe reale'),
        body: lt('Make smarter decisions', 'Merrni vendime me te zgjuara'),
    },
];
const featureCards = [
    {
        kind: 'patients',
        title: lt('Patient Management', 'Menaxhimi i pacienteve'),
        body: lt('Centralize patient profiles, history, and communication in one place.', 'Qendralizoni profilet, historine dhe komunikimin e pacienteve ne nje vend.'),
    },
    {
        kind: 'appointments',
        title: lt('Appointments', 'Terminet'),
        body: lt('Schedule, manage, and automate appointments with ease.', 'Planifikoni, menaxhoni dhe automatizoni terminet me lehtesi.'),
    },
    {
        kind: 'analytics',
        title: lt('Analytics & Reports', 'Analitika dhe raportet'),
        body: lt('Gain real-time insights and generate custom reports instantly.', 'Fitoni pasqyra ne kohe reale dhe krijoni raporte menjehere.'),
    },
    {
        kind: 'records',
        title: lt('Secure Records', 'Kartela te sigurta'),
        body: lt('Store and access medical records securely with role-based access.', 'Ruani dhe hapni kartelat mjekesore ne menyre te sigurt me role te kontrolluara.'),
    },
];
const scaleStats = [
    { kind: 'users', value: '12,450+', label: lt('Active Patients', 'Pacientet aktive') },
    { kind: 'buildings', value: '320+', label: lt('Clinics Supported', 'Klinika te mbeshtetura') },
    { kind: 'reporting', value: '98,760+', label: lt('Reports Generated', 'Raporte te krijuara') },
    { kind: 'heart', value: '98.6%', label: lt('Satisfaction Rate', 'Shkalla e kenaqesise') },
];
const solutionCards = [
    {
        kind: 'workflow',
        title: lt('Streamline Workflows', 'Thjeshtoni rrjedhat e punes'),
        body: lt('Automate routine tasks and reduce administrative burden.', 'Automatizoni detyrat rutine dhe ulni ngarkesen administrative.'),
    },
    {
        kind: 'visibility',
        title: lt('Improve Patient Visibility', 'Permiresoni dukshmerine e pacienteve'),
        body: lt('Access complete patient information in real time.', 'Hapni informacionin e plote te pacienteve ne kohe reale.'),
    },
    {
        kind: 'reporting',
        title: lt('Faster Reporting', 'Raportim me i shpejte'),
        body: lt('Generate accurate reports in just a few clicks.', 'Krijoni raporte te sakta me vetem pak klikime.'),
    },
    {
        kind: 'lock',
        title: lt('Secure Collaboration', 'Bashkepunim i sigurt'),
        body: lt('Work together safely with role-based permissions.', 'Punoni se bashku ne menyre te sigurt me leje sipas roleve.'),
    },
];
const solutionChecklist = [
    lt('Unified patient, room, and appointment data', 'Te dhena te bashkuara per paciente, dhoma dhe termine'),
    lt('A clear handoff from public site to secure workspace', 'Kalim i qarte nga faqja publike te hapesira e sigurt'),
    lt('A modern look that still feels clinical and trusted', 'Pamje moderne qe ende ndihet klinike dhe e besueshme'),
];
const solutionStats = [
    { value: '42%', label: lt('less admin work', 'me pak pune administrative') },
    { value: '3.8x', label: lt('faster reporting', 'raportim me i shpejte') },
    { value: '24/7', label: lt('secure access', 'qasje e sigurt') },
];
const footerColumns = [
    {
        title: lt('Product', 'Produkti'),
        items: [lt('Features', 'Karakteristikat'), lt('Dashboard', 'Paneli'), lt('Pricing', 'Cmimet'), lt('Integrations', 'Integrimet')],
    },
    {
        title: lt('Solutions', 'Zgjidhjet'),
        items: [lt('Clinics', 'Klinika'), lt('Hospitals', 'Spitale'), lt('Medical Groups', 'Grupe mjekesore'), lt('Telehealth', 'Telemjekesi')],
    },
    {
        title: lt('Company', 'Kompania'),
        items: [lt('About Us', 'Rreth nesh'), lt('Blog', 'Blog'), lt('Careers', 'Karriera'), lt('Contact', 'Kontakti')],
    },
    {
        title: lt('Resources', 'Burimet'),
        items: [lt('Help Center', 'Qendra e ndihmes'), lt('Documentation', 'Dokumentacioni'), lt('Privacy Policy', 'Privatesia'), lt('Terms of Service', 'Kushtet e perdorimit')],
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
    return (_jsxs("main", { className: "landing-page relative flex min-h-screen flex-col overflow-x-hidden px-3 pb-0 pt-3 md:px-5 md:pt-5", children: [_jsx("div", { className: "landing-noise pointer-events-none absolute inset-0" }), _jsx("div", { className: "landing-mesh pointer-events-none absolute inset-0 opacity-70" }), _jsx("div", { className: "landing-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem]" }), _jsx("div", { className: "landing-orb bottom-[-12rem] right-[-7rem] h-[26rem] w-[26rem]" }), _jsxs("div", { className: "relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col", children: [_jsx("header", { className: "landing-shell animate-fade-up sticky top-3 z-40 rounded-[34px] px-5 py-4 md:px-7", children: _jsxs("div", { className: "flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/45", children: [_jsx("img", { src: "/medsphere-logo.png", alt: "MedSphere", className: "h-12 w-auto object-contain" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "landing-display truncate text-2xl text-foreground", children: "MedSphere" }), _jsx("p", { className: "max-w-[23rem] truncate text-sm text-muted-foreground", children: t(commonCopy.appSubtitle) })] })] }), _jsx("nav", { className: "hidden items-center gap-1 xl:flex", children: headerLinks.map((item) => (_jsx("a", { href: item.href, className: "rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-primary/6 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45", children: t(item.label) }, item.href))) }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 xl:justify-end", children: [_jsx(ThemeToggle, { compact: true }), _jsx(LanguageSwitch, { compact: true }), _jsx(Link, { to: "/login", className: "inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45", children: t(lt('Log in', 'Hyr')) }), _jsx(Link, { to: "/login", className: "inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-5 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background", children: t(lt('Continue', 'Vazhdo')) })] })] }) }), _jsx("section", { id: "dashboard", className: "landing-shell mt-6 scroll-mt-28 rounded-[42px] px-5 py-6 md:px-7 md:py-8 xl:px-9 xl:py-9", children: _jsxs("div", { className: "grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.02fr)] xl:items-center", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/6 px-4 py-2 text-sm font-semibold text-primary shadow-soft", children: [_jsx("span", { className: "inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-beat" }), t(lt('All-in-one healthcare management platform', 'Platforme e plote per menaxhimin shendetesor'))] }), _jsxs("div", { className: "max-w-2xl", children: [_jsxs("h1", { className: "landing-display text-[clamp(3rem,6vw,6rem)] leading-[0.9] text-foreground", children: [t(lt('Smarter healthcare', 'Shendetesi me e zgjuar')), _jsxs("span", { className: "block", children: [t(lt('starts', 'fillon')), " ", _jsx("span", { className: "landing-highlight", children: t(lt('here.', 'ketu.')) })] })] }), _jsx("p", { className: "mt-5 max-w-xl text-base leading-8 text-muted-foreground md:text-lg", children: t(lt('MedSphere helps clinics, hospitals, and medical teams manage data, appointments, patients, and analytics in one secure platform.', 'MedSphere i ndihmon klinikat, spitalet dhe ekipet mjekesore te menaxhojne te dhena, termine, paciente dhe analitika ne nje platforme te sigurt.')) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsx(Link, { to: "/login", className: "inline-flex h-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-7 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background", children: t(lt('Start with login', 'Fillo me hyrjen')) }), _jsx("a", { href: "#features", className: "inline-flex h-14 items-center justify-center rounded-full border border-primary/20 bg-card/80 px-7 text-sm font-semibold text-primary shadow-soft transition hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background", children: t(lt('Explore features', 'Shiko karakteristikat')) })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: trustSignals.map((item, index) => (_jsxs("article", { className: "animate-fade-up rounded-[26px] border border-border/60 bg-white/80 p-4 shadow-soft", style: { animationDelay: `${140 + index * 120}ms` }, children: [_jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: item.kind }) }), _jsx("p", { className: "mt-4 text-sm font-semibold text-foreground", children: t(item.title) }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t(item.body) })] }, item.title.en))) })] }), _jsxs("div", { className: "relative xl:pl-2", children: [_jsx("div", { className: "landing-stage animate-fade-up p-4 md:p-5 [animation-delay:120ms] xl:ml-auto xl:max-w-[820px]", children: _jsxs("div", { className: "grid overflow-hidden rounded-[34px] border border-border/70 bg-white shadow-[0_34px_80px_hsl(var(--primary)/0.12)] xl:grid-cols-[164px_minmax(0,1fr)]", children: [_jsxs("aside", { className: "flex flex-col gap-4 bg-[linear-gradient(180deg,hsl(212_84%_27%),hsl(217_73%_18%))] px-3 py-4 text-white", children: [_jsxs("div", { className: "flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/10 px-3 py-3", children: [_jsx("img", { src: "/medsphere.png", alt: "", "aria-hidden": "true", className: "h-9 w-9 rounded-xl object-cover" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-xs font-semibold uppercase tracking-[0.28em] text-white/70", children: "MedSphere" }), _jsx("p", { className: "truncate text-sm text-white/90", children: t(lt('Overview', 'Permbledhje')) })] })] }), _jsx("nav", { className: "space-y-2", children: dashboardMenu.map((item, index) => (_jsxs("div", { className: `flex items-center gap-2.5 rounded-[18px] px-3 py-2.5 text-sm ${index === 0 ? 'bg-[linear-gradient(135deg,hsl(var(--accent)/0.42),hsl(var(--secondary)/0.28))] text-white shadow-soft' : 'text-white/72'}`, children: [_jsx("span", { className: `inline-flex h-8 w-8 items-center justify-center rounded-xl ${index === 0 ? 'bg-white/18' : 'bg-white/10'}`, children: _jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-current" }) }), _jsx("span", { children: t(item) })] }, item.en))) }), _jsxs("div", { className: "mt-auto rounded-[24px] border border-white/12 bg-white/10 p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-white/68", children: t(lt('Secure records', 'Kartela te sigurta')) }), _jsx("p", { className: "landing-display mt-3 text-3xl", children: "100%" }), _jsx("p", { className: "mt-2 text-sm text-white/72", children: t(lt('Protected and role-based', 'Te mbrojtura dhe sipas roleve')) })] })] }), _jsxs("div", { className: "space-y-4 p-4 md:p-5", children: [_jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-primary", children: t(lt('Overview', 'Permbledhje')) }), _jsx("h2", { className: "landing-display mt-1 text-3xl text-foreground", children: t(lt('MedSphere dashboard', 'Paneli i MedSphere')) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "hidden items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-muted-foreground lg:flex", children: [_jsxs("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[1.8]", children: [_jsx("circle", { cx: "11", cy: "11", r: "6" }), _jsx("path", { d: "m20 20-3.2-3.2" })] }), t(lt('Search patients, appointments...', 'Kerkoni paciente, termine...'))] }), _jsxs("div", { className: "flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-2 py-2 shadow-soft", children: [_jsx("span", { className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-sm font-bold text-white", children: "SJ" }), _jsxs("div", { className: "pr-2", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Dr. Sarah Johnson" }), _jsx("p", { className: "text-xs text-muted-foreground", children: t(lt('Administrator', 'Administratore')) })] })] })] })] }), _jsx("div", { className: "grid gap-3 md:grid-cols-2 2xl:grid-cols-4", children: overviewStats.map((item, index) => (_jsxs("article", { className: "animate-fade-up rounded-[24px] border border-border/60 bg-white p-4 shadow-soft", style: { animationDelay: `${220 + index * 100}ms` }, children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(item.label) }), _jsx("p", { className: "landing-display mt-3 break-words text-[clamp(2rem,3vw,3rem)] leading-none text-foreground", children: item.value }), _jsx("p", { className: "mt-2 text-sm font-semibold text-emerald-600", children: item.delta })] }, item.label.en))) }), _jsxs("div", { className: "grid gap-3 xl:grid-cols-[1.16fr_0.84fr]", children: [_jsxs("article", { className: "rounded-[28px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t(commonCopy.todayAppointments) }), _jsx("a", { href: "#pricing", className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: t(lt('View all', 'Shiko te gjitha')) })] }), _jsx("div", { className: "mt-4 space-y-3", children: appointmentRows.map((item) => (_jsxs("div", { className: "flex items-center gap-3 rounded-[20px] border border-border/50 bg-background/55 px-3 py-3", children: [_jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary", children: item.name
                                                                                                .split(' ')
                                                                                                .map((part) => part[0])
                                                                                                .join('')
                                                                                                .slice(0, 2) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-semibold text-foreground", children: item.name }), _jsx("p", { className: "truncate text-xs text-muted-foreground", children: t(item.detail) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs font-semibold text-foreground", children: item.time }), _jsx("span", { className: `mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tone}`, children: t(item.status) })] })] }, `${item.name}-${item.time}`))) })] }), _jsxs("div", { className: "grid content-start gap-3", children: [_jsxs("article", { className: "rounded-[28px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t(lt('Health Analytics', 'Analitika shendetesore')) }), _jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: t(lt('This month', 'Kete muaj')) })] }), _jsx("div", { className: "mt-4 rounded-[24px] border border-border/50 bg-background/60 p-3", children: _jsxs("svg", { viewBox: "0 0 360 180", className: "h-44 w-full", children: [_jsx("path", { d: "M24 152H336", stroke: "hsl(var(--border))", strokeWidth: "1" }), _jsx("path", { d: "M24 110H336", stroke: "hsl(var(--border))", strokeWidth: "1" }), _jsx("path", { d: "M24 68H336", stroke: "hsl(var(--border))", strokeWidth: "1" }), _jsx("path", { d: "M24 136C48 128 58 110 82 110C106 110 112 133 136 133C160 133 170 88 194 88C218 88 226 118 250 118C274 118 282 63 306 63C320 63 330 74 336 82", fill: "none", stroke: "url(#medsphere-chart)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("defs", { children: _jsxs("linearGradient", { id: "medsphere-chart", x1: "24", x2: "336", y1: "0", y2: "0", children: [_jsx("stop", { offset: "0%", stopColor: "hsl(var(--secondary))" }), _jsx("stop", { offset: "54%", stopColor: "hsl(var(--accent))" }), _jsx("stop", { offset: "100%", stopColor: "hsl(var(--primary))" })] }) })] }) })] }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: [
                                                                                    {
                                                                                        title: lt('Doctor Activity', 'Aktiviteti i mjekeve'),
                                                                                        value: '78%',
                                                                                        note: '+6.2%',
                                                                                        icon: 'analytics',
                                                                                    },
                                                                                    {
                                                                                        title: lt('Active Treatments', 'Trajtimet aktive'),
                                                                                        value: '1,104',
                                                                                        note: '+9.1%',
                                                                                        icon: 'records',
                                                                                    },
                                                                                ].map((item) => (_jsxs("article", { className: "rounded-[22px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: item.icon }) }), _jsx("p", { className: "mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(item.title) }), _jsx("p", { className: "landing-display mt-2 text-[2rem] leading-none text-foreground", children: item.value }), _jsx("p", { className: "mt-2 text-sm font-semibold text-emerald-600", children: item.note })] }, item.title.en))) }), _jsxs("article", { className: "rounded-[22px] border border-border/60 bg-white p-4 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: "appointments" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(lt('Upcoming Appointments', 'Termine ne vazhdim')) }), _jsx("p", { className: "landing-display mt-2 text-[2rem] leading-none text-foreground", children: "32" })] })] }), _jsx("p", { className: "mt-2 text-sm font-semibold text-emerald-600", children: t(lt('Today', 'Sot')) })] })] })] })] })] }) }), _jsxs("div", { className: "animate-float-slow absolute -right-2 top-12 hidden rounded-[24px] border border-border/60 bg-white/90 p-4 shadow-soft 2xl:block", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-primary", children: t(lt('Platform uptime', 'Disponueshmeria')) }), _jsx("p", { className: "landing-display mt-2 text-3xl text-foreground", children: "99.98%" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t(lt('Across clinics and hospitals', 'Ne klinika dhe spitale')) })] })] })] }) }), _jsx("section", { id: "features", className: "mt-8 grid scroll-mt-28 gap-4 xl:grid-cols-4", children: featureCards.map((item, index) => (_jsxs("article", { className: "landing-shell animate-fade-up rounded-[30px] p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/25", style: { animationDelay: `${160 + index * 90}ms` }, children: [_jsx("div", { className: "inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.18))] text-primary", children: _jsx(LandingIcon, { kind: item.kind, className: "h-6 w-6 fill-none stroke-current stroke-[1.8]" }) }), _jsx("h3", { className: "mt-5 text-xl font-semibold text-foreground", children: t(item.title) }), _jsx("p", { className: "mt-3 text-sm leading-7 text-muted-foreground", children: t(item.body) })] }, item.title.en))) }), _jsx("section", { className: "landing-shell mt-6 rounded-[34px] px-5 py-5 md:px-7", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))] xl:items-center", children: [_jsxs("div", { className: "pr-0 xl:pr-6", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-primary", children: t(lt('Trusted by care teams', 'I besuar nga ekipet e kujdesit')) }), _jsx("h2", { className: "landing-display mt-2 text-[2rem] leading-tight text-foreground", children: t(lt('Built to support better care at scale.', 'Ndertuar per te mbeshtetur kujdes me te mire ne shkalle.')) })] }), scaleStats.map((item) => (_jsxs("article", { className: "rounded-[24px] border border-border/60 bg-white/80 px-4 py-4 shadow-soft xl:border-l xl:border-r-0 xl:border-t-0 xl:border-b-0 xl:rounded-none xl:bg-transparent xl:px-6 xl:shadow-none", children: [_jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary", children: _jsx(LandingIcon, { kind: item.kind }) }), _jsx("p", { className: "landing-display mt-4 text-3xl text-foreground", children: item.value }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t(item.label) })] }, item.label.en)))] }) }), _jsxs("section", { id: "solutions", className: "mt-8 grid items-start scroll-mt-28 gap-6 xl:grid-cols-[0.72fr_1.28fr]", children: [_jsxs("div", { className: "grid self-start content-start gap-4", children: [_jsxs("article", { className: "landing-shell rounded-[36px] p-6 md:p-8", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-primary", children: t(lt('How MedSphere helps', 'Si ndihmon MedSphere')) }), _jsx("h2", { className: "landing-display mt-3 text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.94] text-foreground", children: t(lt('Better care. Smarter operations.', 'Kujdes me i mire. Operacione me te zgjuara.')) }), _jsx("p", { className: "mt-4 text-base leading-8 text-muted-foreground", children: t(lt('From the guest-facing first impression to daily staff workflows, MedSphere keeps the experience calm, trustworthy, and operationally useful.', 'Nga pershtypja e pare publike deri tek rrjedhat e punes se stafit, MedSphere e mban eksperiencen te qete, te besueshme dhe te dobishme ne praktike.')) })] }), _jsxs("article", { className: "landing-shell relative overflow-hidden rounded-[34px] p-6 shadow-soft", children: [_jsx("div", { className: "landing-orb left-[-6rem] top-[-6rem] h-40 w-40 opacity-60" }), _jsxs("div", { className: "relative z-10", children: [_jsx("img", { src: "/medsphere-logo.png", alt: "MedSphere", className: "h-16 w-auto object-contain" }), _jsx("div", { className: "mt-6 grid gap-3", children: solutionChecklist.map((item) => (_jsxs("div", { className: "flex items-start gap-3 rounded-[20px] border border-border/60 bg-white/80 px-4 py-3", children: [_jsx("span", { className: "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary/18 text-secondary", children: _jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[2]", children: _jsx("path", { d: "m5 12 4 4 10-10" }) }) }), _jsx("p", { className: "text-sm text-foreground", children: t(item) })] }, item.en))) })] })] })] }), _jsxs("div", { className: "grid self-start content-start gap-4 md:grid-cols-2", children: [solutionCards.map((item, index) => (_jsxs("article", { className: "landing-shell animate-fade-up self-start rounded-[30px] p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/25", style: { animationDelay: `${180 + index * 100}ms` }, children: [_jsx("div", { className: "inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.18))] text-primary", children: _jsx(LandingIcon, { kind: item.kind, className: "h-6 w-6 fill-none stroke-current stroke-[1.8]" }) }), _jsx("h3", { className: "mt-5 text-xl font-semibold text-foreground", children: t(item.title) }), _jsx("p", { className: "mt-3 text-sm leading-7 text-muted-foreground", children: t(item.body) })] }, item.title.en))), _jsx("article", { className: "landing-shell col-span-full rounded-[30px] p-5 md:p-6", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_repeat(3,minmax(0,0.6fr))] md:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.22em] text-primary", children: t(lt('Operational impact', 'Ndikim operacional')) }), _jsx("h3", { className: "mt-2 text-xl font-semibold text-foreground", children: t(lt('Less waiting between every care step.', 'Me pak pritje mes cdo hapi te kujdesit.')) })] }), solutionStats.map((item) => (_jsxs("div", { className: "rounded-[22px] border border-border/60 bg-white/80 p-4", children: [_jsx("p", { className: "landing-display text-3xl leading-none text-foreground", children: item.value }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t(item.label) })] }, item.value)))] }) })] })] }), _jsx("section", { id: "pricing", className: "mt-8 !mb-8 scroll-mt-28 overflow-hidden rounded-[36px] border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] px-6 py-6 text-white shadow-[0_28px_70px_hsl(var(--primary)/0.22)] md:px-8", children: _jsxs("div", { className: "grid gap-5 xl:grid-cols-[1.1fr_auto] xl:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-white/72", children: t(lt('Ready to transform your healthcare operations?', 'Gati te transformoni operacionet e kujdesit?')) }), _jsx("h2", { className: "landing-display mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[0.96]", children: t(lt('Bring the same clarity from first visit to daily care delivery.', 'Sillni te njejten qartesi nga vizita e pare te kujdesi i perditshem.')) }), _jsx("p", { className: "mt-3 max-w-2xl text-sm leading-7 text-white/78 md:text-base", children: t(lt('Join healthcare providers using MedSphere to manage patients, rooms, teams, and reporting with one connected system.', 'Bashkohuni me ofruesit e kujdesit qe perdorin MedSphere per paciente, dhoma, ekipe dhe raporte ne nje sistem te lidhur.')) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row xl:justify-end", children: [_jsx(Link, { to: "/login", className: "inline-flex h-14 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-primary shadow-soft transition hover:translate-y-[-1px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80", children: t(lt('Log in to continue', 'Hyni per te vazhduar')) }), _jsx("a", { href: "#page-end", className: "inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80", children: t(lt('Talk to MedSphere', 'Flisni me MedSphere')) })] })] }) }), _jsxs("footer", { id: "contact", className: "mt-5 landing-shell mt-auto scroll-mt-28 rounded-[34px] px-6 py-6 md:px-8 md:py-7", children: [_jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.95fr_repeat(4,minmax(0,1fr))]", children: [_jsx("div", { children: _jsxs(Link, { to: "/", className: "inline-flex items-center gap-3", children: [_jsx("img", { src: "/medsphere-logo.png", alt: "MedSphere", className: "h-14 w-auto object-contain" }), _jsxs("div", { children: [_jsx("p", { className: "landing-display text-2xl text-foreground", children: "MedSphere" }), _jsx("p", { className: "max-w-[16rem] text-sm leading-7 text-muted-foreground", children: t(lt('Empowering healthcare organizations with technology that feels trustworthy and modern.', 'Fuqizojme organizatat shendetesore me teknologji moderne dhe te besueshme.')) })] })] }) }), footerColumns.map((column) => (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: t(column.title) }), _jsx("div", { className: "mt-3 space-y-2.5 text-sm text-muted-foreground", children: column.items.map((item) => (_jsx("p", { children: t(item) }, item.en))) })] }, column.title.en)))] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between", children: [_jsx("p", { children: t(lt('hello@medsphere.com', 'hello@medsphere.com')) }), _jsx("p", { children: t(lt('(888) 123-4567', '(888) 123-4567')) }), _jsx("p", { children: t(lt('© 2026 MedSphere. All rights reserved.', '© 2026 MedSphere. Te gjitha te drejtat e rezervuara.')) })] })] }), _jsx("div", { id: "page-end", className: "h-px scroll-mt-[100vh]", "aria-hidden": "true" })] })] }));
}
