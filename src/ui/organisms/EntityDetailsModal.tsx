import { type ReactNode } from 'react';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import { commonCopy, lt } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  camelToSnake,
  formatCurrency,
  formatDate,
  formatPersonName,
  getErrorMessage,
  getStatusVariant,
  getValue,
} from '@/libs/app/utils';
import type { ColumnConfig, FormFieldConfig, Language, LocalizedText } from '@/types/app';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import Modal from '@/ui/molecules/Modal';

type EntityDetailsConfig = {
  singular: LocalizedText;
  columns?: ColumnConfig[];
  fields?: FormFieldConfig[];
  getItemTitle?: (item: any) => string;
};

type EntityDetailsModalProps = {
  open: boolean;
  config: EntityDetailsConfig;
  item: any;
  loading: boolean;
  error?: any;
  onClose: () => void;
  onRetry?: () => Promise<unknown> | unknown;
};

type DetailEntry = {
  key: string;
  label: LocalizedText;
  value: ReactNode;
  full?: boolean;
};

const detailAliases: Record<string, string[]> = {
  date: ['appointmentDate', 'recordDate', 'invoiceDate'],
  duration: ['frequency'],
  medicine: ['medicationName'],
  name: ['firstName', 'lastName', 'fullName'],
  patient: ['patientId', 'patientName'],
  doctor: ['doctorId', 'doctorName'],
  room: ['roomId', 'roomNumber'],
  time: ['appointmentTime'],
};

function isSensitiveKey(key: string) {
  const normalized = key.toLowerCase();
  return normalized.includes('password') || normalized.includes('token') || normalized.includes('secret');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function isScalarValue(value: unknown) {
  return ['string', 'number', 'boolean'].includes(typeof value);
}

function isScalarArray(value: unknown) {
  return Array.isArray(value) && value.some(isScalarValue);
}

function isEmptyValue(value: unknown) {
  return value === undefined || value === null || (typeof value === 'string' && !value.trim());
}

function formatFieldLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\bid\b/i, 'ID')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function getLocalizedLabelKey(
  label: LocalizedText,
  translate: (value: LocalizedText) => string
) {
  return translate(label).trim().toLowerCase();
}

function markSeenKey(seenKeys: Set<string>, key: string) {
  seenKeys.add(key);
  seenKeys.add(camelToSnake(key));

  detailAliases[key]?.forEach((alias) => {
    seenKeys.add(alias);
    seenKeys.add(camelToSnake(alias));
  });
}

function isDateKey(key: string) {
  return /date/i.test(key) || /At$/.test(key);
}

function isAmountKey(key: string) {
  return /amount|balance|charge|cost|price|total/i.test(key);
}

function formatScalarValue(
  key: string,
  value: unknown,
  language: Language,
  translate: (value: LocalizedText) => string
): ReactNode {
  if (isEmptyValue(value)) {
    return translate(commonCopy.notAvailable);
  }

  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'success' : 'secondary'}>
        {translate(value ? lt('Yes', 'Ja') : lt('No', 'Nein'))}
      </Badge>
    );
  }

  if (Array.isArray(value)) {
    const scalarValues = value.filter(isScalarValue);

    if (!scalarValues.length) {
      return translate(commonCopy.notAvailable);
    }

    return scalarValues.join(', ');
  }

  const text = String(value);

  if (/status/i.test(key)) {
    return <Badge variant={getStatusVariant(text) as any}>{text}</Badge>;
  }

  if (isAmountKey(key) && Number.isFinite(Number(value))) {
    return formatCurrency(Number(value), language);
  }

  if (isDateKey(key)) {
    return formatDate(text, language) || text;
  }

  return text;
}

function getRelationLabel(value: unknown) {
  if (!isPlainObject(value)) {
    return '';
  }

  return (
    formatPersonName(value) ||
    String(getValue(value, 'name', 'roomNumber', 'medicationName', 'medicine', 'email', 'username', 'id'))
  );
}

function getFieldValue(item: any, field: FormFieldConfig) {
  if (field.source && field.name.endsWith('Id')) {
    const relationKey = field.name.slice(0, -2);
    const relationLabel = getRelationLabel(getValue(item, relationKey));

    if (relationLabel) {
      return relationLabel;
    }
  }

  return getValue(item, field.name, camelToSnake(field.name));
}

function getOptionLabel(
  field: FormFieldConfig,
  value: unknown,
  translate: (value: LocalizedText) => string
) {
  const normalizedValue = String(value ?? '').trim().toLowerCase();
  const option = field.options?.find((entry) => entry.value.toLowerCase() === normalizedValue);
  return option ? translate(option.label) : value;
}

function getDetailTitle(
  config: EntityDetailsConfig,
  item: any,
  translate: (value: LocalizedText) => string
) {
  return (
    config.getItemTitle?.(item) ||
    formatPersonName(item) ||
    String(getValue(item, 'name', 'roomNumber', 'medicine', 'medicationName', 'email', 'username', 'id')) ||
    translate(commonCopy.notAvailable)
  );
}

function shouldUseFullWidth(value: ReactNode, field?: FormFieldConfig) {
  return field?.type === 'textarea' || (typeof value === 'string' && value.length > 90);
}

function buildConfiguredEntries(
  config: EntityDetailsConfig,
  item: any,
  language: Language,
  translate: (value: LocalizedText) => string
) {
  const entries: DetailEntry[] = [];
  const seenKeys = new Set<string>();
  const seenLabels = new Set<string>();

  const addEntry = (entry: DetailEntry) => {
    const labelKey = getLocalizedLabelKey(entry.label, translate);
    const hasSeenKey = seenKeys.has(entry.key) || seenKeys.has(camelToSnake(entry.key));

    if (hasSeenKey || seenLabels.has(labelKey)) {
      markSeenKey(seenKeys, entry.key);
      return;
    }

    entries.push(entry);
    seenLabels.add(labelKey);
    markSeenKey(seenKeys, entry.key);
  };

  config.columns?.forEach((column) => {
    const rawValue = getValue(item, column.key, camelToSnake(column.key));
    const renderedValue = column.render
      ? column.render(item, language)
      : formatScalarValue(column.key, rawValue, language, translate);

    addEntry({
      key: column.key,
      label: column.label,
      value: isEmptyValue(renderedValue) ? translate(commonCopy.notAvailable) : renderedValue,
      full: typeof renderedValue === 'string' && renderedValue.length > 90,
    });
  });

  config.fields?.forEach((field) => {
    if (field.type === 'password' || field.name === 'accountMode' || isSensitiveKey(field.name)) {
      markSeenKey(seenKeys, field.name);
      return;
    }

    const rawValue = getFieldValue(item, field);
    const optionValue = getOptionLabel(field, rawValue, translate);
    const formattedValue = formatScalarValue(field.name, optionValue, language, translate);

    addEntry({
      key: field.name,
      label: field.label,
      value: formattedValue,
      full: shouldUseFullWidth(formattedValue, field),
    });
  });

  return { entries, seenKeys, seenLabels };
}

function buildExtraEntries(
  item: any,
  seenKeys: Set<string>,
  seenLabels: Set<string>,
  language: Language,
  translate: (value: LocalizedText) => string
) {
  if (!isPlainObject(item)) {
    return [];
  }

  return Object.entries(item).reduce<DetailEntry[]>((entries, [key, value]) => {
    const labelText = formatFieldLabel(key);
    const label = lt(labelText, labelText);
    const labelKey = getLocalizedLabelKey(label, translate);

    if (
      isSensitiveKey(key) ||
      seenKeys.has(key) ||
      seenKeys.has(camelToSnake(key)) ||
      seenLabels.has(labelKey) ||
      (!isScalarValue(value) && !isScalarArray(value))
    ) {
      return entries;
    }

    const formattedValue = formatScalarValue(key, value, language, translate);

    entries.push({
      key,
      label,
      value: formattedValue,
      full: typeof formattedValue === 'string' && formattedValue.length > 90,
    });

    return entries;
  }, []);
}

function buildNestedSections(
  item: any,
  language: Language,
  translate: (value: LocalizedText) => string
) {
  if (!isPlainObject(item)) {
    return [];
  }

  return Object.entries(item).reduce<Array<{ key: string; title: string; entries: DetailEntry[] }>>(
    (sections, [key, value]) => {
      if (isSensitiveKey(key) || !isPlainObject(value)) {
        return sections;
      }

      const entries = Object.entries(value).reduce<DetailEntry[]>((nestedEntries, [nestedKey, nestedValue]) => {
        if (isSensitiveKey(nestedKey) || (!isScalarValue(nestedValue) && !isScalarArray(nestedValue))) {
          return nestedEntries;
        }

        const labelText = formatFieldLabel(nestedKey);
        const formattedValue = formatScalarValue(nestedKey, nestedValue, language, translate);

        nestedEntries.push({
          key: nestedKey,
          label: lt(labelText, labelText),
          value: formattedValue,
          full: typeof formattedValue === 'string' && formattedValue.length > 90,
        });

        return nestedEntries;
      }, []);

      if (entries.length) {
        sections.push({
          key,
          title: formatFieldLabel(key),
          entries,
        });
      }

      return sections;
    },
    []
  );
}

function DetailGrid({ entries }: { entries: DetailEntry[] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map((entry) => (
        <div key={entry.key} className={entry.full ? 'md:col-span-2' : undefined}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(entry.label)}
          </p>
          <div className="mt-1 break-words text-sm text-foreground">{entry.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function EntityDetailsModal({
  open,
  config,
  item,
  loading,
  error,
  onClose,
  onRetry,
}: EntityDetailsModalProps) {
  const { language, t } = useLanguage();
  const title = `${t(commonCopy.details)}: ${t(config.singular)}`;
  const itemTitle = item ? getDetailTitle(config, item, t) : t(commonCopy.notAvailable);
  const configured = item ? buildConfiguredEntries(config, item, language, t) : {
    entries: [],
    seenKeys: new Set<string>(),
    seenLabels: new Set<string>(),
  };
  const extraEntries = item
    ? buildExtraEntries(item, configured.seenKeys, configured.seenLabels, language, t)
    : [];
  const nestedSections = item ? buildNestedSections(item, language, t) : [];
  const entries = [...configured.entries, ...extraEntries];

  return (
    <Modal open={open} title={title} description={itemTitle} onClose={onClose}>
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
      ) : entries.length || nestedSections.length ? (
        <div className="space-y-6">
          {entries.length ? <DetailGrid entries={entries} /> : null}

          {nestedSections.length ? (
            <div className="space-y-3">
              {nestedSections.map((section) => (
                <section
                  key={section.key}
                  className="rounded-2xl border border-border/70 bg-background/45 p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  <div className="mt-4">
                    <DetailGrid entries={section.entries} />
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState compact title={t(commonCopy.emptyTitle)} description={t(commonCopy.noItems)} />
      )}
    </Modal>
  );
}
