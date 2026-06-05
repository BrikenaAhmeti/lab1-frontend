import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import Button from '@/ui/atoms/Button';
import DatePicker from '@/ui/atoms/DatePicker';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import TimePicker from '@/ui/atoms/TimePicker';
import Textarea from '@/ui/atoms/Textarea';
import { commonCopy } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getErrorMessage, getFieldInputValue } from '@/libs/app/utils';
import type { ModuleConfig, ReferenceOption } from '@/types/app';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import Modal from '@/ui/molecules/Modal';

type EntityFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  config: ModuleConfig;
  item: any;
  references: Record<string, ReferenceOption[]>;
  loading: boolean;
  error?: any;
  saving: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onRetry?: () => Promise<void> | void;
  onSubmit: (values: any) => Promise<void> | void;
};

function getDefaultValues(config: ModuleConfig, item: any) {
  const mode = item ? 'edit' : 'create';
  const defaults: Record<string, any> = { ...(config.createDefaults || {}) };

  config.fields.forEach((field) => {
    defaults[field.name] = item ? getFieldInputValue(item, field) : defaults[field.name] ?? '';
  });

  return {
    ...defaults,
    ...(config.getInitialValues ? config.getInitialValues(item, mode) : {}),
  };
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
  readOnly = false,
  onClose,
  onRetry,
  onSubmit,
}: EntityFormModalProps) {
  const { t } = useLanguage();
  const form = useForm({
    resolver: zodResolver(config.getSchema ? config.getSchema(mode) : config.schema),
    defaultValues: getDefaultValues(config, item),
  });

  useEffect(() => {
    form.reset(getDefaultValues(config, item));
  }, [config, form, item, open]);

  const title = mode === 'create' ? t(commonCopy.createRecord) : t(commonCopy.editRecord);
  const description = t(config.singular);
  const formValues = form.watch();
  const visibleFields = config.fields.filter((field) => {
    if (field.modes && !field.modes.includes(mode)) {
      return false;
    }

    return field.showWhen ? field.showWhen(formValues, mode) : true;
  });

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
          <fieldset className="grid gap-4 md:grid-cols-2" disabled={readOnly}>
            {visibleFields.map((field) => {
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
                  <Controller
                    key={field.name}
                    name={field.name}
                    control={form.control}
                    render={({ field: ctl }) => (
                      <Select
                        label={t(field.label)}
                        hint={field.hint ? t(field.hint) : undefined}
                        error={error}
                        name={ctl.name}
                        value={typeof ctl.value === 'string' ? ctl.value : String(ctl.value ?? '')}
                        onBlur={ctl.onBlur}
                        onChange={ctl.onChange}
                        ref={ctl.ref}
                      >
                        <option value="">{t(commonCopy.search)}</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                );
              }

              if (field.type === 'date' || field.type === 'time') {
                const Picker = field.type === 'date' ? DatePicker : TimePicker;

                return (
                  <Controller
                    key={field.name}
                    name={field.name}
                    control={form.control}
                    render={({ field: ctl }) => (
                      <Picker
                        label={t(field.label)}
                        hint={field.hint ? t(field.hint) : undefined}
                        error={error}
                        name={ctl.name}
                        value={typeof ctl.value === 'string' ? ctl.value : String(ctl.value ?? '')}
                        onBlur={ctl.onBlur}
                        onChange={ctl.onChange}
                        ref={ctl.ref}
                      />
                    )}
                  />
                );
              }

              return (
                <Input
                  key={field.name}
                  type={field.type}
                  step={field.step}
                  label={t(field.label)}
                  hint={field.hint ? t(field.hint) : undefined}
                  error={error}
                  placeholder={field.placeholder ? t(field.placeholder) : ''}
                  {...form.register(field.name)}
                />
              );
            })}
          </fieldset>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t(commonCopy.cancel)}
            </Button>
            {!readOnly ? (
              <Button type="submit" loading={saving}>
                {mode === 'create' ? t(commonCopy.create) : t(commonCopy.update)}
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </Modal>
  );
}
