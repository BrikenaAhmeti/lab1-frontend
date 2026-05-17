import Button from '@/ui/atoms/Button';
import { commonCopy } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import Modal from '@/ui/molecules/Modal';

type DeleteModalProps = {
  open: boolean;
  itemTitle: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteModal({
  open,
  itemTitle,
  deleting,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  const { t } = useLanguage();

  return (
    <Modal
      open={open}
      title={t(commonCopy.deleteTitle)}
      description={`${itemTitle}. ${t(commonCopy.deleteDescription)}`}
      onClose={onClose}
    >
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          {t(commonCopy.cancel)}
        </Button>
        <Button variant="danger" loading={deleting} onClick={onConfirm}>
          {t(commonCopy.confirmDelete)}
        </Button>
      </div>
    </Modal>
  );
}
