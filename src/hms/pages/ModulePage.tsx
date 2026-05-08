import { useEffect, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import { commonCopy } from '../copy';
import DataTable from '../components/DataTable';
import DeleteModal from '../components/DeleteModal';
import EmptyState from '../components/EmptyState';
import EntityFormModal from '../components/EntityFormModal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { fetchArrayWithFallback } from '../lib/api';
import { getErrorMessage, normalizeArrayResponse, stripEmptyValues } from '../lib/utils';
import { moduleConfigs, referenceConfigs } from '../modules';
import type { ModuleKey, ReferenceOption, SortOrder } from '../types';

function getPositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildNextSearchParams(current: URLSearchParams, values: Record<string, string | number | null>) {
  const next = new URLSearchParams(current);

  Object.entries(values).forEach(([key, value]) => {
    if (value === null || value === '') {
      next.delete(key);
      return;
    }

    next.set(key, String(value));
  });

  return next;
}

function collectReferenceKeys(moduleKey: ModuleKey) {
  const config = moduleConfigs[moduleKey];
  const keys = new Set<string>();

  config.filters.forEach((filter) => {
    if (filter.source) {
      keys.add(filter.source);
    }
  });

  config.fields.forEach((field) => {
    if (field.source) {
      keys.add(field.source);
    }
  });

  return Array.from(keys);
}

function getReferenceOptions(moduleKey: ModuleKey) {
  return collectReferenceKeys(moduleKey);
}

export default function ModulePage({ moduleKey }: { moduleKey: ModuleKey }) {
  const config = moduleConfigs[moduleKey];
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState<{ open: boolean; mode: 'create' | 'edit'; item: any }>({
    open: false,
    mode: 'create',
    item: null,
  });
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const { t } = useLanguage();
  const { can } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const searchParamsKey = searchParams.toString();

  const page = getPositiveNumber(searchParams.get('page'), 1);
  const limit = getPositiveNumber(searchParams.get('limit'), config.listPageSizeOptions?.[0] || 10);
  const sortBy = searchParams.get('sortBy') || config.defaultSortBy;
  const order = (searchParams.get('order') as SortOrder | null) || config.defaultOrder || 'DESC';

  const filterValues = config.filters.reduce<Record<string, string>>((values, filter) => {
    values[filter.name] = searchParams.get(filter.name) || '';
    return values;
  }, {});

  useEffect(() => {
    const nextFilters = config.filters.reduce<Record<string, string>>((values, filter) => {
      values[filter.name] = searchParams.get(filter.name) || '';
      return values;
    }, {});

    setDraftFilters(nextFilters);
  }, [config.filters, moduleKey, searchParams, searchParamsKey]);

  const listParams = {
    page,
    limit,
    sortBy,
    order,
    ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value)),
  };

  const listQuery = useQuery({
    queryKey: [moduleKey, listParams],
    queryFn: () => config.service.list(listParams),
  });

  useEffect(() => {
    if (!listQuery.data) {
      return;
    }

    if (listQuery.data.totalPages > 0 && page > listQuery.data.totalPages) {
      setSearchParams(
        buildNextSearchParams(searchParams, {
          page: listQuery.data.totalPages,
        })
      );
    }
  }, [listQuery.data, page, searchParams, setSearchParams]);

  const detailQuery = useQuery({
    queryKey: [moduleKey, 'detail', formState.item?.id],
    queryFn: () => config.service.get(String(formState.item?.id)),
    enabled: formState.open && formState.mode === 'edit' && Boolean(formState.item?.id),
  });

  const referenceKeys = getReferenceOptions(moduleKey);
  const referenceQueries = useQueries({
    queries: referenceKeys.map((key) => ({
      queryKey: ['reference', key],
      queryFn: async () => {
        const referenceConfig = referenceConfigs[key];
        const paths = [referenceConfig.endpoint, ...(referenceConfig.fallbackPaths || [])];
        const items = await fetchArrayWithFallback(paths.map((path) => {
          if (!referenceConfig.params) {
            return path;
          }

          const query = new URLSearchParams(
            Object.entries(referenceConfig.params).map(([paramKey, value]) => [paramKey, String(value)])
          );

          return `${path}?${query.toString()}`;
        }));

        return normalizeArrayResponse(items).map((item: any) => ({
          value: String(item.id),
          label: referenceConfig.getLabel(item),
        }));
      },
    })),
  });

  const references = referenceKeys.reduce<Record<string, ReferenceOption[]>>((values, key, index) => {
    values[key] = ((referenceQueries[index]?.data || []) as ReferenceOption[]).filter(
      (option: ReferenceOption) => option.label
    );
    return values;
  }, {});

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = config.cleanPayload
        ? config.cleanPayload(values, formState.mode)
        : stripEmptyValues(values);

      if (formState.mode === 'edit' && formState.item?.id) {
        await config.service.update(String(formState.item.id), payload);
        return;
      }

      await config.service.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [moduleKey] });
      setFormState({ open: false, mode: 'create', item: null });
      showToast(
        formState.mode === 'edit' ? t(commonCopy.updateSuccess) : t(commonCopy.createSuccess),
        'success'
      );
    },
    onError: (error) => {
      showToast(getErrorMessage(error), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: any) => {
      await config.service.remove(String(item.id));
    },
    onSuccess: async () => {
      const shouldGoBack = listQuery.data?.data.length === 1 && page > 1;

      if (shouldGoBack) {
        setSearchParams(
          buildNextSearchParams(searchParams, {
            page: page - 1,
          })
        );
      }

      await queryClient.invalidateQueries({ queryKey: [moduleKey] });
      setDeleteItem(null);
      showToast(t(commonCopy.deleteSuccess), 'success');
    },
    onError: (error) => {
      showToast(getErrorMessage(error), 'error');
    },
  });

  const currentItem = formState.mode === 'edit' ? detailQuery.data || formState.item : formState.item;

  const openCreateModal = () => {
    setFormState({ open: true, mode: 'create', item: null });
  };

  const openEditModal = (item: any) => {
    setFormState({ open: true, mode: 'edit', item });
  };

  const submitFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSearchParams(
      buildNextSearchParams(searchParams, {
        page: 1,
        ...Object.fromEntries(
          Object.entries(draftFilters).map(([key, value]) => [key, value.trim() ? value.trim() : null])
        ),
      })
    );
  };

  const clearFilters = () => {
    const cleared = config.filters.reduce<Record<string, string>>((values, filter) => {
      values[filter.name] = '';
      return values;
    }, {});

    setDraftFilters(cleared);
    setSearchParams(
      buildNextSearchParams(searchParams, {
        page: 1,
        ...Object.fromEntries(config.filters.map((filter) => [filter.name, null])),
      })
    );
  };

  const hasForbiddenError = listQuery.error && (listQuery.error as any)?.response?.status === 403;
  const hasUnauthorizedError = listQuery.error && (listQuery.error as any)?.response?.status === 401;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(config.label)}
        description={t(config.description)}
        action={
          <RoleGuard allow={config.permissions?.create}>
            <Button onClick={openCreateModal}>{t(commonCopy.createNew)}</Button>
          </RoleGuard>
        }
      />

      <Card title={t(commonCopy.filters)} description={t(commonCopy.results)}>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={submitFilters}>
          {config.filters.map((filter) => {
            const referenceOptions = filter.source ? references[filter.source] || [] : [];
            const options = filter.source
              ? referenceOptions
              : (filter.options || []).map((option) => ({
                  value: option.value,
                  label: t(option.label),
                }));

            if (filter.type === 'select') {
              return (
                <Select
                  key={filter.name}
                  label={t(filter.label)}
                  value={draftFilters[filter.name] || ''}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      [filter.name]: event.target.value,
                    }))
                  }
                >
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
                key={filter.name}
                type={filter.type}
                label={t(filter.label)}
                placeholder={filter.placeholder ? t(filter.placeholder) : ''}
                value={draftFilters[filter.name] || ''}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    [filter.name]: event.target.value,
                  }))
                }
              />
            );
          })}

          <Select
            label={t(commonCopy.sortBy)}
            value={sortBy}
            onChange={(event) =>
              setSearchParams(
                buildNextSearchParams(searchParams, {
                  sortBy: event.target.value,
                  page: 1,
                })
              )
            }
          >
            {config.sortOptions.map((sortOption) => (
              <option key={sortOption.value} value={sortOption.value}>
                {t(sortOption.label)}
              </option>
            ))}
          </Select>

          <Select
            label={t(commonCopy.order)}
            value={order}
            onChange={(event) =>
              setSearchParams(
                buildNextSearchParams(searchParams, {
                  order: event.target.value,
                  page: 1,
                })
              )
            }
          >
            <option value="ASC">{t(commonCopy.ascending)}</option>
            <option value="DESC">{t(commonCopy.descending)}</option>
          </Select>

          <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-2 xl:items-end">
            <Button type="submit">{t(commonCopy.search)}</Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              {t(commonCopy.clear)}
            </Button>
          </div>
        </form>
      </Card>

      {hasUnauthorizedError ? (
        <EmptyState
          title={t(commonCopy.unauthorizedTitle)}
          description={t(commonCopy.unauthorizedDescription)}
        />
      ) : hasForbiddenError ? (
        <EmptyState title={t(commonCopy.forbiddenTitle)} description={t(commonCopy.forbiddenDescription)} />
      ) : listQuery.error ? (
        <EmptyState
          title={t(commonCopy.emptyTitle)}
          description={getErrorMessage(listQuery.error)}
          action={
            <Button variant="outline" onClick={() => listQuery.refetch()}>
              {t(commonCopy.retry)}
            </Button>
          }
        />
      ) : !listQuery.data?.data.length && !listQuery.isLoading ? (
        <EmptyState title={t(commonCopy.emptyTitle)} description={t(commonCopy.emptyDescription)} />
      ) : (
        <>
          <Card title={t(commonCopy.results)}>
            <DataTable
              rows={listQuery.data?.data || []}
              columns={config.columns}
              loading={listQuery.isLoading}
              actions={(item) => (
                <div className="flex flex-wrap gap-2">
                  {can(config.permissions?.edit) ? (
                    <Button size="sm" variant="outline" onClick={() => openEditModal(item)}>
                      {t(commonCopy.edit)}
                    </Button>
                  ) : null}
                  {can(config.permissions?.delete) ? (
                    <Button size="sm" variant="danger" onClick={() => setDeleteItem(item)}>
                      {t(commonCopy.delete)}
                    </Button>
                  ) : null}
                </div>
              )}
            />
          </Card>

          <Pagination
            page={page}
            totalPages={listQuery.data?.totalPages || 1}
            total={listQuery.data?.total || 0}
            limit={limit}
            limitOptions={config.listPageSizeOptions || [10, 20, 50]}
            onPageChange={(nextPage) =>
              setSearchParams(
                buildNextSearchParams(searchParams, {
                  page: nextPage,
                })
              )
            }
            onLimitChange={(nextLimit) =>
              setSearchParams(
                buildNextSearchParams(searchParams, {
                  limit: nextLimit,
                  page: 1,
                })
              )
            }
          />
        </>
      )}

      <EntityFormModal
        open={formState.open}
        mode={formState.mode}
        config={config}
        item={currentItem}
        references={references}
        loading={detailQuery.isLoading}
        saving={saveMutation.isPending}
        onClose={() => setFormState({ open: false, mode: 'create', item: null })}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
      />

      <DeleteModal
        open={Boolean(deleteItem)}
        itemTitle={deleteItem ? config.getItemTitle?.(deleteItem) || String(deleteItem.id) : ''}
        deleting={deleteMutation.isPending}
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(deleteItem);
        }}
      />
    </div>
  );
}
