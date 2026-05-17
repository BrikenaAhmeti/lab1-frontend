import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import { commonCopy } from '@/config/copy';
import DataTable from '@/ui/organisms/DataTable';
import DeleteModal from '@/ui/organisms/DeleteModal';
import EmptyState from '@/ui/molecules/EmptyState';
import EntityFormModal from '@/ui/organisms/EntityFormModal';
import PasswordFormModal from '@/ui/organisms/PasswordFormModal';
import PageHeader from '@/ui/molecules/PageHeader';
import Pagination from '@/ui/molecules/Pagination';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useToast } from '@/app/contexts/ToastContext';
import { authApi, fetchArrayWithFallback } from '@/libs/app/api';
import { getErrorMessage, normalizeArrayResponse, stripEmptyValues } from '@/libs/app/utils';
import { moduleConfigs, referenceConfigs } from '@/config/modules';
import { getModulePermissionFlags, moduleKeyToAppModule } from '@/config/permissions';
import type { ModuleKey, ReferenceOption, SortOrder } from '@/types/app';

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

function normalizeReferenceParams(params?: Record<string, string | number>) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (key === 'sortBy' && typeof value === 'string' && value.trim()) {
        return [
          key,
          value
            .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
            .toLowerCase(),
        ];
      }

      return [key, String(value)];
    })
  );
}

function collectReferenceKeys(moduleKey: ModuleKey, scope: 'all' | 'fields' | 'filters' = 'all') {
  const config = moduleConfigs[moduleKey];
  const keys = new Set<string>();

  if (scope === 'all' || scope === 'filters') {
    config.filters.forEach((filter) => {
      if (filter.source) {
        keys.add(filter.source);
      }
    });
  }

  if (scope === 'all' || scope === 'fields') {
    config.fields.forEach((field) => {
      if (field.source) {
        keys.add(field.source);
      }
    });
  }

  return Array.from(keys);
}

function getReferenceOptions(moduleKey: ModuleKey) {
  return collectReferenceKeys(moduleKey);
}

function supportsAction(config: (typeof moduleConfigs)[ModuleKey], action: 'create' | 'edit' | 'delete') {
  return config.actions?.[action] ?? true;
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
  const [passwordResetItem, setPasswordResetItem] = useState<any>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const searchParamsKey = searchParams.toString();
  const permissionFlags = getModulePermissionFlags(user?.roles, moduleKeyToAppModule[moduleKey]);
  const canCreate = permissionFlags.canCreate;
  const canUpdate = permissionFlags.canUpdate;
  const canDelete = permissionFlags.canDelete;
  const canRead = permissionFlags.canRead;
  const isReadOnly = permissionFlags.isReadOnly;

  const page = getPositiveNumber(searchParams.get('page'), 1);
  const limit = getPositiveNumber(searchParams.get('limit'), config.listPageSizeOptions?.[0] || 10);
  const sortBy = searchParams.get('sortBy') || config.defaultSortBy;
  const order = (searchParams.get('order') as SortOrder | null) || config.defaultOrder || 'DESC';

  const filterValues = useMemo(
    () => {
      const params = new URLSearchParams(searchParamsKey);

      return config.filters.reduce<Record<string, string>>((values, filter) => {
        values[filter.name] = params.get(filter.name) || '';
        return values;
      }, {});
    },
    [config.filters, searchParamsKey]
  );

  useEffect(() => {
    setDraftFilters(filterValues);
  }, [filterValues, moduleKey]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      order,
      ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value)),
    }),
    [filterValues, limit, order, page, sortBy]
  );

  const listQuery = useQuery({
    queryKey: [moduleKey, listParams],
    queryFn: () => config.service.list(listParams),
    staleTime: 30_000,
    enabled: canRead,
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
    enabled: canRead && formState.open && formState.mode === 'edit' && Boolean(formState.item?.id),
    staleTime: 30_000,
  });

  const referenceKeys = useMemo(() => getReferenceOptions(moduleKey), [moduleKey]);
  const filterReferenceKeys = useMemo(() => collectReferenceKeys(moduleKey, 'filters'), [moduleKey]);
  const formReferenceKeys = useMemo(() => collectReferenceKeys(moduleKey, 'fields'), [moduleKey]);
  const filterReferenceKeySet = useMemo(() => new Set(filterReferenceKeys), [filterReferenceKeys]);
  const formReferenceKeySet = useMemo(() => new Set(formReferenceKeys), [formReferenceKeys]);
  const referenceQueries = useQueries({
    queries: referenceKeys.map((key) => ({
      queryKey: ['reference', key],
      enabled: filterReferenceKeySet.has(key) || (formState.open && formReferenceKeySet.has(key)),
      queryFn: async () => {
        const referenceConfig = referenceConfigs[key];
        const paths = [referenceConfig.endpoint, ...(referenceConfig.fallbackPaths || [])];
        const items = await fetchArrayWithFallback(paths.map((path) => {
          if (!referenceConfig.params) {
            return path;
          }

          const query = new URLSearchParams(normalizeReferenceParams(referenceConfig.params));

          return `${path}?${query.toString()}`;
        }));

        return normalizeArrayResponse(items).map((item: any) => ({
          value: String(item.id),
          label: referenceConfig.getLabel(item),
        }));
      },
      staleTime: 5 * 60_000,
    })),
  });

  const references = useMemo(
    () =>
      referenceKeys.reduce<Record<string, ReferenceOption[]>>((values, key, index) => {
        values[key] = ((referenceQueries[index]?.data || []) as ReferenceOption[]).filter(
          (option: ReferenceOption) => option.label
        );
        return values;
      }, {}),
    [referenceKeys, referenceQueries]
  );
  const formReferenceError =
    formState.open &&
    referenceQueries.find((query, index) => formReferenceKeySet.has(referenceKeys[index]) && query.error)?.error;
  const formReferenceLoading =
    formState.open &&
    formReferenceKeySet.size > 0 &&
    referenceQueries.some((query, index) => formReferenceKeySet.has(referenceKeys[index]) && query.isLoading && !query.data);

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
      showToast(getErrorMessage(error, t), 'error');
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
      showToast(getErrorMessage(error, t), 'error');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      await authApi.resetUserPassword(userId, { password });
    },
    onSuccess: () => {
      setPasswordResetItem(null);
      showToast(t(commonCopy.passwordResetSuccess), 'success');
    },
    onError: (error) => {
      showToast(getErrorMessage(error, t), 'error');
    },
  });

  const currentItem = formState.mode === 'edit' ? detailQuery.data || formState.item : formState.item;

  const openCreateModal = useCallback(() => {
    setFormState({ open: true, mode: 'create', item: null });
  }, []);

  const openEditModal = useCallback((item: any) => {
    setFormState({ open: true, mode: 'edit', item });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormState({ open: false, mode: 'create', item: null });
  }, []);

  const updateSearchParams = useCallback(
    (values: Record<string, string | number | null>) => {
      setSearchParams(buildNextSearchParams(searchParams, values));
    },
    [searchParams, setSearchParams]
  );

  const retryFormState = useCallback(async () => {
    if (formState.mode === 'edit' && formState.item?.id) {
      await detailQuery.refetch();
    }

    await Promise.all(
      referenceQueries
        .filter((_, index) => formReferenceKeySet.has(referenceKeys[index]))
        .map((query) => query.refetch())
    );
  }, [detailQuery, formReferenceKeySet, formState.item?.id, formState.mode, referenceKeys, referenceQueries]);

  const submitFilters = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      updateSearchParams({
        page: 1,
        ...Object.fromEntries(
          Object.entries(draftFilters).map(([key, value]) => [key, value.trim() ? value.trim() : null])
        ),
      });
    },
    [draftFilters, updateSearchParams]
  );

  const clearFilters = useCallback(() => {
    const cleared = config.filters.reduce<Record<string, string>>((values, filter) => {
      values[filter.name] = '';
      return values;
    }, {});

    setDraftFilters(cleared);
    updateSearchParams({
      page: 1,
      ...Object.fromEntries(config.filters.map((filter) => [filter.name, null])),
    });
  }, [config.filters, updateSearchParams]);

  const renderActions = useCallback(
    (item: any) => (
      <div className="flex flex-wrap gap-2">
        {supportsAction(config, 'edit') && canUpdate ? (
          <Button size="sm" variant="outline" onClick={() => openEditModal(item)}>
            {t(commonCopy.edit)}
          </Button>
        ) : null}
        {supportsAction(config, 'delete') && canDelete ? (
          <Button size="sm" variant="danger" onClick={() => setDeleteItem(item)}>
            {t(commonCopy.delete)}
          </Button>
        ) : null}
        {config.getPasswordUserId && canUpdate && config.getPasswordUserId(item) ? (
          <Button size="sm" variant="ghost" onClick={() => setPasswordResetItem(item)}>
            {t(commonCopy.resetPassword)}
          </Button>
        ) : null}
      </div>
    ),
    [canDelete, canUpdate, config, openEditModal, t]
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      updateSearchParams({
        page: nextPage,
      });
    },
    [updateSearchParams]
  );

  const handleLimitChange = useCallback(
    (nextLimit: number) => {
      updateSearchParams({
        limit: nextLimit,
        page: 1,
      });
    },
    [updateSearchParams]
  );

  const hasForbiddenError = listQuery.error && (listQuery.error as any)?.response?.status === 403;
  const hasUnauthorizedError = listQuery.error && (listQuery.error as any)?.response?.status === 401;
  const emptyAction = supportsAction(config, 'create') && canCreate ? (
    <Button onClick={openCreateModal}>{t(commonCopy.createNew)}</Button>
  ) : null;
  const hasTableActions =
    (supportsAction(config, 'edit') && canUpdate) ||
    (supportsAction(config, 'delete') && canDelete) ||
    Boolean(config.getPasswordUserId && canUpdate);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(config.label)}
        description={t(config.description)}
        action={
          supportsAction(config, 'create') && canCreate ? (
            <>
              <Button onClick={openCreateModal}>{t(commonCopy.createNew)}</Button>
            </>
          ) : null
        }
      />

      {isReadOnly ? (
        <div className="flex">
          <Badge variant="secondary">{t(commonCopy.readOnly)}</Badge>
        </div>
      ) : null}

      <Card title={t(commonCopy.filters)} description={t(commonCopy.results)} className="relative z-20">
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
              updateSearchParams({
                sortBy: event.target.value,
                page: 1,
              })
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
              updateSearchParams({
                order: event.target.value,
                page: 1,
              })
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

      {!canRead ? (
        <EmptyState
          tone="locked"
          title={t(commonCopy.forbiddenTitle)}
          description={t(commonCopy.accessDeniedDescription)}
        />
      ) : hasUnauthorizedError ? (
        <EmptyState
          tone="locked"
          title={t(commonCopy.unauthorizedTitle)}
          description={t(commonCopy.unauthorizedDescription)}
        />
      ) : hasForbiddenError ? (
        <EmptyState
          tone="locked"
          title={t(commonCopy.forbiddenTitle)}
          description={t(commonCopy.forbiddenDescription)}
        />
      ) : listQuery.error ? (
        <EmptyState
          tone="error"
          title={t(commonCopy.errorTitle)}
          description={getErrorMessage(listQuery.error, t)}
          action={
            <Button variant="outline" onClick={() => listQuery.refetch()}>
              {t(commonCopy.retry)}
            </Button>
          }
        />
      ) : !listQuery.data?.data.length && !listQuery.isLoading ? (
        <EmptyState
          title={t(commonCopy.emptyTitle)}
          description={t(commonCopy.emptyDescription)}
          action={emptyAction}
        />
      ) : (
        <>
          <Card title={t(commonCopy.results)} className="relative z-0">
            <DataTable
              rows={listQuery.data?.data || []}
              columns={config.columns}
              loading={listQuery.isLoading}
              actions={hasTableActions ? renderActions : undefined}
            />
          </Card>

          <Pagination
            page={page}
            totalPages={listQuery.data?.totalPages || 1}
            total={listQuery.data?.total || 0}
            limit={limit}
            limitOptions={config.listPageSizeOptions || [10, 20, 50]}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      <EntityFormModal
        open={formState.open}
        mode={formState.mode}
        config={config}
        item={currentItem}
        references={references}
        loading={detailQuery.isLoading || formReferenceLoading}
        error={detailQuery.error || formReferenceError}
        saving={saveMutation.isPending}
        readOnly={formState.mode === 'edit' && !canUpdate}
        onClose={closeFormModal}
        onRetry={retryFormState}
        onSubmit={(values) => {
          saveMutation.mutate(values);
        }}
      />

      <DeleteModal
        open={Boolean(deleteItem)}
        itemTitle={deleteItem ? config.getItemTitle?.(deleteItem) || String(deleteItem.id) : ''}
        deleting={deleteMutation.isPending}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteItem);
        }}
      />

      <PasswordFormModal
        open={Boolean(passwordResetItem)}
        mode="reset"
        title={t(commonCopy.resetPassword)}
        description={t(commonCopy.passwordResetDescription)}
        saving={resetPasswordMutation.isPending}
        onClose={() => setPasswordResetItem(null)}
        onSubmit={async (values) => {
          const userId = passwordResetItem ? config.getPasswordUserId?.(passwordResetItem) : '';

          if (!userId) {
            return;
          }

          await resetPasswordMutation.mutateAsync({
            userId,
            password: values.password,
          });
        }}
      />
    </div>
  );
}
