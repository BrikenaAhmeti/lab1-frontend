import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import Badge from '@/ui/atoms/Badge';
import Card from '@/ui/atoms/Card';
export default function ModulePage({ moduleKey }) {
    const { t } = useTranslation('common');
    const title = t(`modules.${moduleKey}.title`);
    const description = t(`modules.${moduleKey}.description`);
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })] }), _jsx(Badge, { variant: "secondary", children: t('modulePage.badge') })] }), _jsx(Card, { title: t('modulePage.overviewTitle', { module: title }), description: t('modulePage.overviewDescription', { module: title }), children: _jsx("p", { className: "text-sm text-muted-foreground", children: t('modulePage.overviewBody', { module: title }) }) }), _jsx(Card, { title: t('modulePage.helperTitle'), description: t('modulePage.helperDescription'), children: _jsx("p", { className: "text-sm text-muted-foreground", children: t('modulePage.helperBody') }) })] }));
}
