import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
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
function getPositiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function buildNextSearchParams(current, values) {
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
function collectReferenceKeys(moduleKey, scope = 'all') {
    const config = moduleConfigs[moduleKey];
    const keys = new Set();
    if (scope === 'all') {
        config.filters.forEach((filter) => {
            if (filter.source) {
                keys.add(filter.source);
            }
        });
    }
    config.fields.forEach((field) => {
        if (field.source) {
            keys.add(field.source);
        }
    });
    return Array.from(keys);
}
function getReferenceOptions(moduleKey) {
    return collectReferenceKeys(moduleKey);
}
function supportsAction(config, action) {
    return config.actions?.[action] ?? true;
}
export default function ModulePage({ moduleKey }) {
    const config = moduleConfigs[moduleKey];
    const [searchParams, setSearchParams] = useSearchParams();
    const [draftFilters, setDraftFilters] = useState({});
    const [formState, setFormState] = useState({
        open: false,
        mode: 'create',
        item: null,
    });
    const [deleteItem, setDeleteItem] = useState(null);
    const { t } = useLanguage();
    const { can } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const searchParamsKey = searchParams.toString();
    const page = getPositiveNumber(searchParams.get('page'), 1);
    const limit = getPositiveNumber(searchParams.get('limit'), config.listPageSizeOptions?.[0] || 10);
    const sortBy = searchParams.get('sortBy') || config.defaultSortBy;
    const order = searchParams.get('order') || config.defaultOrder || 'DESC';
    const filterValues = useMemo(() => {
        const params = new URLSearchParams(searchParamsKey);
        return config.filters.reduce((values, filter) => {
            values[filter.name] = params.get(filter.name) || '';
            return values;
        }, {});
    }, [config.filters, searchParamsKey]);
    useEffect(() => {
        setDraftFilters(filterValues);
    }, [filterValues, moduleKey]);
    const listParams = useMemo(() => ({
        page,
        limit,
        sortBy,
        order,
        ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value)),
    }), [filterValues, limit, order, page, sortBy]);
    const listQuery = useQuery({
        queryKey: [moduleKey, listParams],
        queryFn: () => config.service.list(listParams),
        staleTime: 30_000,
    });
    useEffect(() => {
        if (!listQuery.data) {
            return;
        }
        if (listQuery.data.totalPages > 0 && page > listQuery.data.totalPages) {
            setSearchParams(buildNextSearchParams(searchParams, {
                page: listQuery.data.totalPages,
            }));
        }
    }, [listQuery.data, page, searchParams, setSearchParams]);
    const detailQuery = useQuery({
        queryKey: [moduleKey, 'detail', formState.item?.id],
        queryFn: () => config.service.get(String(formState.item?.id)),
        enabled: formState.open && formState.mode === 'edit' && Boolean(formState.item?.id),
        staleTime: 30_000,
    });
    const referenceKeys = useMemo(() => getReferenceOptions(moduleKey), [moduleKey]);
    const formReferenceKeys = useMemo(() => collectReferenceKeys(moduleKey, 'fields'), [moduleKey]);
    const formReferenceKeySet = useMemo(() => new Set(formReferenceKeys), [formReferenceKeys]);
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
                    const query = new URLSearchParams(Object.entries(referenceConfig.params).map(([paramKey, value]) => [paramKey, String(value)]));
                    return `${path}?${query.toString()}`;
                }));
                return normalizeArrayResponse(items).map((item) => ({
                    value: String(item.id),
                    label: referenceConfig.getLabel(item),
                }));
            },
            staleTime: 5 * 60_000,
        })),
    });
    const references = useMemo(() => referenceKeys.reduce((values, key, index) => {
        values[key] = (referenceQueries[index]?.data || []).filter((option) => option.label);
        return values;
    }, {}), [referenceKeys, referenceQueries]);
    const formReferenceError = formState.open &&
        referenceQueries.find((query, index) => formReferenceKeySet.has(referenceKeys[index]) && query.error)?.error;
    const formReferenceLoading = formState.open &&
        formReferenceKeySet.size > 0 &&
        referenceQueries.some((query, index) => formReferenceKeySet.has(referenceKeys[index]) && query.isLoading && !query.data);
    const saveMutation = useMutation({
        mutationFn: async (values) => {
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
            showToast(formState.mode === 'edit' ? t(commonCopy.updateSuccess) : t(commonCopy.createSuccess), 'success');
        },
        onError: (error) => {
            showToast(getErrorMessage(error, t), 'error');
        },
    });
    const deleteMutation = useMutation({
        mutationFn: async (item) => {
            await config.service.remove(String(item.id));
        },
        onSuccess: async () => {
            const shouldGoBack = listQuery.data?.data.length === 1 && page > 1;
            if (shouldGoBack) {
                setSearchParams(buildNextSearchParams(searchParams, {
                    page: page - 1,
                }));
            }
            await queryClient.invalidateQueries({ queryKey: [moduleKey] });
            setDeleteItem(null);
            showToast(t(commonCopy.deleteSuccess), 'success');
        },
        onError: (error) => {
            showToast(getErrorMessage(error, t), 'error');
        },
    });
    const currentItem = formState.mode === 'edit' ? detailQuery.data || formState.item : formState.item;
    const openCreateModal = useCallback(() => {
        setFormState({ open: true, mode: 'create', item: null });
    }, []);
    const openEditModal = useCallback((item) => {
        setFormState({ open: true, mode: 'edit', item });
    }, []);
    const closeFormModal = useCallback(() => {
        setFormState({ open: false, mode: 'create', item: null });
    }, []);
    const updateSearchParams = useCallback((values) => {
        setSearchParams(buildNextSearchParams(searchParams, values));
    }, [searchParams, setSearchParams]);
    const retryFormState = useCallback(async () => {
        if (formState.mode === 'edit' && formState.item?.id) {
            await detailQuery.refetch();
        }
        await Promise.all(referenceQueries
            .filter((_, index) => formReferenceKeySet.has(referenceKeys[index]))
            .map((query) => query.refetch()));
    }, [detailQuery, formReferenceKeySet, formState.item?.id, formState.mode, referenceKeys, referenceQueries]);
    const submitFilters = useCallback((event) => {
        event.preventDefault();
        updateSearchParams({
            page: 1,
            ...Object.fromEntries(Object.entries(draftFilters).map(([key, value]) => [key, value.trim() ? value.trim() : null])),
        });
    }, [draftFilters, updateSearchParams]);
    const clearFilters = useCallback(() => {
        const cleared = config.filters.reduce((values, filter) => {
            values[filter.name] = '';
            return values;
        }, {});
        setDraftFilters(cleared);
        updateSearchParams({
            page: 1,
            ...Object.fromEntries(config.filters.map((filter) => [filter.name, null])),
        });
    }, [config.filters, updateSearchParams]);
    const renderActions = useCallback((item) => (_jsxs("div", { className: "flex flex-wrap gap-2", children: [supportsAction(config, 'edit') && can(config.permissions?.edit) ? (_jsx(Button, { size: "sm", variant: "outline", onClick: () => openEditModal(item), children: t(commonCopy.edit) })) : null, supportsAction(config, 'delete') && can(config.permissions?.delete) ? (_jsx(Button, { size: "sm", variant: "danger", onClick: () => setDeleteItem(item), children: t(commonCopy.delete) })) : null] })), [can, config.permissions?.delete, config.permissions?.edit, openEditModal, t]);
    const handlePageChange = useCallback((nextPage) => {
        updateSearchParams({
            page: nextPage,
        });
    }, [updateSearchParams]);
    const handleLimitChange = useCallback((nextLimit) => {
        updateSearchParams({
            limit: nextLimit,
            page: 1,
        });
    }, [updateSearchParams]);
    const hasForbiddenError = listQuery.error && listQuery.error?.response?.status === 403;
    const hasUnauthorizedError = listQuery.error && listQuery.error?.response?.status === 401;
    const emptyAction = supportsAction(config, 'create') && can(config.permissions?.create) ? (_jsx(Button, { onClick: openCreateModal, children: t(commonCopy.createNew) })) : null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t(config.label), description: t(config.description), action: supportsAction(config, 'create') ? (_jsx(RoleGuard, { allow: config.permissions?.create, children: _jsx(Button, { onClick: openCreateModal, children: t(commonCopy.createNew) }) })) : null }), _jsx(Card, { title: t(commonCopy.filters), description: t(commonCopy.results), className: "relative z-20", children: _jsxs("form", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", onSubmit: submitFilters, children: [config.filters.map((filter) => {
                            const referenceOptions = filter.source ? references[filter.source] || [] : [];
                            const options = filter.source
                                ? referenceOptions
                                : (filter.options || []).map((option) => ({
                                    value: option.value,
                                    label: t(option.label),
                                }));
                            if (filter.type === 'select') {
                                return (_jsxs(Select, { label: t(filter.label), value: draftFilters[filter.name] || '', onChange: (event) => setDraftFilters((current) => ({
                                        ...current,
                                        [filter.name]: event.target.value,
                                    })), children: [_jsx("option", { value: "", children: t(commonCopy.search) }), options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }, filter.name));
                            }
                            return (_jsx(Input, { type: filter.type, label: t(filter.label), placeholder: filter.placeholder ? t(filter.placeholder) : '', value: draftFilters[filter.name] || '', onChange: (event) => setDraftFilters((current) => ({
                                    ...current,
                                    [filter.name]: event.target.value,
                                })) }, filter.name));
                        }), _jsx(Select, { label: t(commonCopy.sortBy), value: sortBy, onChange: (event) => updateSearchParams({
                                sortBy: event.target.value,
                                page: 1,
                            }), children: config.sortOptions.map((sortOption) => (_jsx("option", { value: sortOption.value, children: t(sortOption.label) }, sortOption.value))) }), _jsxs(Select, { label: t(commonCopy.order), value: order, onChange: (event) => updateSearchParams({
                                order: event.target.value,
                                page: 1,
                            }), children: [_jsx("option", { value: "ASC", children: t(commonCopy.ascending) }), _jsx("option", { value: "DESC", children: t(commonCopy.descending) })] }), _jsxs("div", { className: "flex flex-wrap gap-3 md:col-span-2 xl:col-span-2 xl:items-end", children: [_jsx(Button, { type: "submit", children: t(commonCopy.search) }), _jsx(Button, { type: "button", variant: "outline", onClick: clearFilters, children: t(commonCopy.clear) })] })] }) }), hasUnauthorizedError ? (_jsx(EmptyState, { tone: "locked", title: t(commonCopy.unauthorizedTitle), description: t(commonCopy.unauthorizedDescription) })) : hasForbiddenError ? (_jsx(EmptyState, { tone: "locked", title: t(commonCopy.forbiddenTitle), description: t(commonCopy.forbiddenDescription) })) : listQuery.error ? (_jsx(EmptyState, { tone: "error", title: t(commonCopy.errorTitle), description: getErrorMessage(listQuery.error, t), action: _jsx(Button, { variant: "outline", onClick: () => listQuery.refetch(), children: t(commonCopy.retry) }) })) : !listQuery.data?.data.length && !listQuery.isLoading ? (_jsx(EmptyState, { title: t(commonCopy.emptyTitle), description: t(commonCopy.emptyDescription), action: emptyAction })) : (_jsxs(_Fragment, { children: [_jsx(Card, { title: t(commonCopy.results), className: "relative z-0", children: _jsx(DataTable, { rows: listQuery.data?.data || [], columns: config.columns, loading: listQuery.isLoading, actions: renderActions }) }), _jsx(Pagination, { page: page, totalPages: listQuery.data?.totalPages || 1, total: listQuery.data?.total || 0, limit: limit, limitOptions: config.listPageSizeOptions || [10, 20, 50], onPageChange: handlePageChange, onLimitChange: handleLimitChange })] })), _jsx(EntityFormModal, { open: formState.open, mode: formState.mode, config: config, item: currentItem, references: references, loading: detailQuery.isLoading || formReferenceLoading, error: detailQuery.error || formReferenceError, saving: saveMutation.isPending, onClose: closeFormModal, onRetry: retryFormState, onSubmit: (values) => {
                    saveMutation.mutate(values);
                } }), _jsx(DeleteModal, { open: Boolean(deleteItem), itemTitle: deleteItem ? config.getItemTitle?.(deleteItem) || String(deleteItem.id) : '', deleting: deleteMutation.isPending, onClose: () => setDeleteItem(null), onConfirm: () => {
                    deleteMutation.mutate(deleteItem);
                } })] }));
}
