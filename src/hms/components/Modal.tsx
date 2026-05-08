import { useEffect, type ReactNode } from 'react';
import Button from '@/ui/atoms/Button';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, description, onClose, children }: ModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <button
        type="button"
        aria-label={t(commonCopy.close)}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-border bg-card p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t(commonCopy.close)}
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
