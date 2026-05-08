import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Button from '@/ui/atoms/Button';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';
export default function DeleteModal({ open, itemTitle, deleting, onClose, onConfirm, }) {
    const { t } = useLanguage();
    return (_jsx(Modal, { open: open, title: t(commonCopy.deleteTitle), description: `${itemTitle}. ${t(commonCopy.deleteDescription)}`, onClose: onClose, children: _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", onClick: onClose, children: t(commonCopy.cancel) }), _jsx(Button, { variant: "danger", loading: deleting, onClick: onConfirm, children: t(commonCopy.confirmDelete) })] }) }));
}
