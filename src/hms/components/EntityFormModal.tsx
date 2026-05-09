import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import { getErrorMessage, getFieldInputValue } from '../lib/utils';
import type { ModuleConfig, ReferenceOption } from '../types';
import EmptyState from './EmptyState';
import ListSkeleton from './ListSkeleton';
import Modal from './Modal';

type EntityFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  config: ModuleConfig;
  item: any;
  references: Record<string, ReferenceOption[]>;
  loading: boolean;
  error?: any;
  saving: boolean;
  onClose: () => void;
  onRetry?: () => Promise<void> | void;
  onSubmit: (values: any) => Promise<void> | void;
};

function getDefaultValues(config: ModuleConfig, item: any) {
  const defaults: Record<string, any> = { ...(config.createDefaults || {}) };

  config.fields.forEach((field) => {
    defaults[field.name] = item ? getFieldInputValue(item, field) : defaults[field.name] ?? '';
  });

  return defaults;
}

export default function EntityFormModal({
  open,
  mode,
  config,
  item,
  references,
  loading,
  error,
  saving,
  onClose,
  onRetry,
  onSubmit,
}: EntityFormModalProps) {
  const { t } = useLanguage();
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: getDefaultValues(config, item),
  });

  useEffect(() => {
    form.reset(getDefaultValues(config, item));
  }, [config, form, item, open]);

  const title = mode === 'create' ? t(commonCopy.createRecord) : t(commonCopy.editRecord);
  const description = t(config.singular);

  return (
    <Modal open={open} title={`${title}: ${description}`} onClose={onClose}>
      {loading ? (
        <ListSkeleton items={4} itemClassName="h-14" />
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
        <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => {
              const error = String(form.formState.errors[field.name]?.message || '');
              const options = field.source
                ? references[field.source] || []
                : (field.options || []).map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }));

              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <Textarea
                      label={t(field.label)}
                      error={error}
                      placeholder={field.placeholder ? t(field.placeholder) : ''}
                      {...form.register(field.name)}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <Select key={field.name} label={t(field.label)} error={error} {...form.register(field.name)}>
                    <option value="">{t(commonCopy.search)}</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                );
              }

              return (
                <Input
                  key={field.name}
                  type={field.type}
                  step={field.step}
                  label={t(field.label)}
                  error={error}
                  placeholder={field.placeholder ? t(field.placeholder) : ''}
                  {...form.register(field.name)}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t(commonCopy.cancel)}
            </Button>
            <Button type="submit" loading={saving}>
              {mode === 'create' ? t(commonCopy.create) : t(commonCopy.update)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
