import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import { commonCopy } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { LocalizedText } from '@/types/app';
import Modal from '@/ui/molecules/Modal';

type PasswordFormMode = 'change' | 'reset';

type PasswordFormModalProps = {
  open: boolean;
  mode: PasswordFormMode;
  title: string;
  description: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: { currentPassword?: string; password: string }) => Promise<void> | void;
};

function buildSchema(t: (value: LocalizedText) => string, mode: PasswordFormMode) {
  const requiredMessage = 'This field is required.';
  const passwordField = z
    .string()
    .min(6, t(commonCopy.passwordMinLength))
    .max(255, t(commonCopy.passwordMaxLength));

  return z
    .object({
      currentPassword:
        mode === 'change' ? z.string().min(1, requiredMessage) : z.string().optional(),
      password: passwordField,
      confirmPassword: z.string().min(1, requiredMessage),
    })
    .superRefine((values, context) => {
      if (values.password !== values.confirmPassword) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: t(commonCopy.passwordMismatch),
        });
      }
    });
}

export default function PasswordFormModal({
  open,
  mode,
  title,
  description,
  saving = false,
  onClose,
  onSubmit,
}: PasswordFormModalProps) {
  const { t } = useLanguage();
  const form = useForm({
    resolver: zodResolver(buildSchema(t, mode)),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [form, open]);

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit({
            currentPassword: values.currentPassword,
            password: values.password,
          });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {mode === 'change' ? (
            <div className="md:col-span-2">
              <Input
                type="password"
                autoComplete="current-password"
                label={t(commonCopy.currentPassword)}
                error={String(form.formState.errors.currentPassword?.message || '')}
                {...form.register('currentPassword')}
              />
            </div>
          ) : null}

          <Input
            type="password"
            autoComplete={mode === 'change' ? 'new-password' : 'off'}
            label={t(mode === 'change' ? commonCopy.newPassword : commonCopy.password)}
            hint={t(commonCopy.passwordMinLength)}
            error={String(form.formState.errors.password?.message || '')}
            {...form.register('password')}
          />

          <Input
            type="password"
            autoComplete={mode === 'change' ? 'new-password' : 'off'}
            label={t(commonCopy.confirmPassword)}
            error={String(form.formState.errors.confirmPassword?.message || '')}
            {...form.register('confirmPassword')}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t(commonCopy.cancel)}
          </Button>
          <Button type="submit" loading={saving}>
            {t(mode === 'change' ? commonCopy.changePassword : commonCopy.resetPassword)}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
