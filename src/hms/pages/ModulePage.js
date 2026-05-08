import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
function collectReferenceKeys(moduleKey) {
    const config = moduleConfigs[moduleKey];
    const keys = new Set();
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
function getReferenceOptions(moduleKey) {
    return collectReferenceKeys(moduleKey);
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
    const filterValues = config.filters.reduce((values, filter) => {
        values[filter.name] = searchParams.get(filter.name) || '';
        return values;
    }, {});
    useEffect(() => {
        const nextFilters = config.filters.reduce((values, filter) => {
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
            setSearchParams(buildNextSearchParams(searchParams, {
                page: listQuery.data.totalPages,
            }));
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
                    const query = new URLSearchParams(Object.entries(referenceConfig.params).map(([paramKey, value]) => [paramKey, String(value)]));
                    return `${path}?${query.toString()}`;
                }));
                return normalizeArrayResponse(items).map((item) => ({
                    value: String(item.id),
                    label: referenceConfig.getLabel(item),
                }));
            },
        })),
    });
    const references = referenceKeys.reduce((values, key, index) => {
        values[key] = (referenceQueries[index]?.data || []).filter((option) => option.label);
        return values;
    }, {});
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
            showToast(getErrorMessage(error), 'error');
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
            showToast(getErrorMessage(error), 'error');
        },
    });
    const currentItem = formState.mode === 'edit' ? detailQuery.data || formState.item : formState.item;
    const openCreateModal = () => {
        setFormState({ open: true, mode: 'create', item: null });
    };
    const openEditModal = (item) => {
        setFormState({ open: true, mode: 'edit', item });
    };
    const submitFilters = (event) => {
        event.preventDefault();
        setSearchParams(buildNextSearchParams(searchParams, {
            page: 1,
            ...Object.fromEntries(Object.entries(draftFilters).map(([key, value]) => [key, value.trim() ? value.trim() : null])),
        }));
    };
    const clearFilters = () => {
        const cleared = config.filters.reduce((values, filter) => {
            values[filter.name] = '';
            return values;
        }, {});
        setDraftFilters(cleared);
        setSearchParams(buildNextSearchParams(searchParams, {
            page: 1,
            ...Object.fromEntries(config.filters.map((filter) => [filter.name, null])),
        }));
    };
    const hasForbiddenError = listQuery.error && listQuery.error?.response?.status === 403;
    const hasUnauthorizedError = listQuery.error && listQuery.error?.response?.status === 401;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t(config.label), description: t(config.description), action: _jsx(RoleGuard, { allow: config.permissions?.create, children: _jsx(Button, { onClick: openCreateModal, children: t(commonCopy.createNew) }) }) }), _jsx(Card, { title: t(commonCopy.filters), description: t(commonCopy.results), children: _jsxs("form", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", onSubmit: submitFilters, children: [config.filters.map((filter) => {
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
                        }), _jsx(Select, { label: t(commonCopy.sortBy), value: sortBy, onChange: (event) => setSearchParams(buildNextSearchParams(searchParams, {
                                sortBy: event.target.value,
                                page: 1,
                            })), children: config.sortOptions.map((sortOption) => (_jsx("option", { value: sortOption.value, children: t(sortOption.label) }, sortOption.value))) }), _jsxs(Select, { label: t(commonCopy.order), value: order, onChange: (event) => setSearchParams(buildNextSearchParams(searchParams, {
                                order: event.target.value,
                                page: 1,
                            })), children: [_jsx("option", { value: "ASC", children: t(commonCopy.ascending) }), _jsx("option", { value: "DESC", children: t(commonCopy.descending) })] }), _jsxs("div", { className: "flex flex-wrap gap-3 md:col-span-2 xl:col-span-2 xl:items-end", children: [_jsx(Button, { type: "submit", children: t(commonCopy.search) }), _jsx(Button, { type: "button", variant: "outline", onClick: clearFilters, children: t(commonCopy.clear) })] })] }) }), hasUnauthorizedError ? (_jsx(EmptyState, { title: t(commonCopy.unauthorizedTitle), description: t(commonCopy.unauthorizedDescription) })) : hasForbiddenError ? (_jsx(EmptyState, { title: t(commonCopy.forbiddenTitle), description: t(commonCopy.forbiddenDescription) })) : listQuery.error ? (_jsx(EmptyState, { title: t(commonCopy.emptyTitle), description: getErrorMessage(listQuery.error), action: _jsx(Button, { variant: "outline", onClick: () => listQuery.refetch(), children: t(commonCopy.retry) }) })) : !listQuery.data?.data.length && !listQuery.isLoading ? (_jsx(EmptyState, { title: t(commonCopy.emptyTitle), description: t(commonCopy.emptyDescription) })) : (_jsxs(_Fragment, { children: [_jsx(Card, { title: t(commonCopy.results), children: _jsx(DataTable, { rows: listQuery.data?.data || [], columns: config.columns, loading: listQuery.isLoading, actions: (item) => (_jsxs("div", { className: "flex flex-wrap gap-2", children: [can(config.permissions?.edit) ? (_jsx(Button, { size: "sm", variant: "outline", onClick: () => openEditModal(item), children: t(commonCopy.edit) })) : null, can(config.permissions?.delete) ? (_jsx(Button, { size: "sm", variant: "danger", onClick: () => setDeleteItem(item), children: t(commonCopy.delete) })) : null] })) }) }), _jsx(Pagination, { page: page, totalPages: listQuery.data?.totalPages || 1, total: listQuery.data?.total || 0, limit: limit, limitOptions: config.listPageSizeOptions || [10, 20, 50], onPageChange: (nextPage) => setSearchParams(buildNextSearchParams(searchParams, {
                            page: nextPage,
                        })), onLimitChange: (nextLimit) => setSearchParams(buildNextSearchParams(searchParams, {
                            limit: nextLimit,
                            page: 1,
                        })) })] })), _jsx(EntityFormModal, { open: formState.open, mode: formState.mode, config: config, item: currentItem, references: references, loading: detailQuery.isLoading, saving: saveMutation.isPending, onClose: () => setFormState({ open: false, mode: 'create', item: null }), onSubmit: async (values) => {
                    await saveMutation.mutateAsync(values);
                } }), _jsx(DeleteModal, { open: Boolean(deleteItem), itemTitle: deleteItem ? config.getItemTitle?.(deleteItem) || String(deleteItem.id) : '', deleting: deleteMutation.isPending, onClose: () => setDeleteItem(null), onConfirm: async () => {
                    await deleteMutation.mutateAsync(deleteItem);
                } })] }));
}
