import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import Modal from '@/ui/molecules/Modal';
import { commonCopy, lt } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { formatPersonName, getErrorMessage, getValue, normalizeRoles } from '@/libs/app/utils';
import type { LocalizedText, User } from '@/types/app';

type ProfileValues = {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
};

type ProfileModalProps = {
  open: boolean;
  user: User | null;
  loading: boolean;
  error?: any;
  saving: boolean;
  onClose: () => void;
  onRetry?: () => Promise<unknown> | unknown;
  onSubmit: (values: {
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string | null;
  }) => Promise<void> | void;
};

const usernamePattern = /^[a-zA-Z0-9._-]+$/;

function buildSchema(t: (value: LocalizedText) => string) {
  return z.object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters.').max(100),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.').max(100),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters.')
      .max(30, 'Username must be 30 characters or fewer.')
      .regex(
        usernamePattern,
        'Use only letters, numbers, dots, underscores, and hyphens.'
      ),
    phoneNumber: z.string().trim().max(30, t(lt('Use 30 characters or fewer.', 'Verwenden Sie höchstens 30 Zeichen.'))),
  });
}

function getDefaults(user: User | null): ProfileValues {
  return {
    firstName: String(getValue(user, 'firstName')),
    lastName: String(getValue(user, 'lastName')),
    username: String(getValue(user, 'username')),
    phoneNumber: String(getValue(user, 'phoneNumber')),
  };
}

function getInitials(value: string, email?: string) {
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return String(email || 'MS').slice(0, 2).toUpperCase();
}

export default function ProfileModal({
  open,
  user,
  loading,
  error,
  saving,
  onClose,
  onRetry,
  onSubmit,
}: ProfileModalProps) {
  const { t } = useLanguage();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: getDefaults(user),
  });
  const fullName = formatPersonName(user) || String(getValue(user, 'email')) || t(lt('Profile', 'Profil'));
  const roles = normalizeRoles(getValue(user, 'roles'));
  const email = String(getValue(user, 'email'));

  useEffect(() => {
    if (open) {
      form.reset(getDefaults(user));
    }
  }, [form, open, user]);

  return (
    <Modal
      open={open}
      title={t(commonCopy.profileDetails)}
      description={t(lt('Review and update your account details.', 'Kontodaten anzeigen und aktualisieren.'))}
      onClose={onClose}
    >
      {loading ? (
        <ListSkeleton items={5} itemClassName="h-14" />
      ) : error ? (
        <EmptyState
          compact
          tone="error"
          title={t(commonCopy.errorTitle)}
          description={getErrorMessage(error, t)}
          action={
            onRetry ? (
              <Button variant="outline" onClick={onRetry}>
                {t(commonCopy.retry)}
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/35">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--secondary)))] text-base font-bold text-white shadow-soft">
                  {getInitials(fullName, email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">{fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{email || t(commonCopy.notAvailable)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {roles.length ? (
                  roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">{t(commonCopy.notAvailable)}</Badge>
                )}
              </div>
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                username: values.username.trim(),
                phoneNumber: values.phoneNumber.trim() || null,
              });
            })}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(lt('First name', 'Vorname'))}
                error={String(form.formState.errors.firstName?.message || '')}
                {...form.register('firstName')}
              />
              <Input
                label={t(lt('Last name', 'Nachname'))}
                error={String(form.formState.errors.lastName?.message || '')}
                {...form.register('lastName')}
              />
              <Input
                label={t(lt('Username', 'Benutzername'))}
                error={String(form.formState.errors.username?.message || '')}
                {...form.register('username')}
              />
              <Input
                label={t(lt('Phone number', 'Telefonnummer'))}
                error={String(form.formState.errors.phoneNumber?.message || '')}
                {...form.register('phoneNumber')}
              />
              <Input
                id="profileEmail"
                label={t(lt('Email', 'E-Mail'))}
                value={email}
                readOnly
                disabled
                className="disabled:opacity-75"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                {t(commonCopy.cancel)}
              </Button>
              <Button type="submit" loading={saving}>
                {t(commonCopy.update)}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
