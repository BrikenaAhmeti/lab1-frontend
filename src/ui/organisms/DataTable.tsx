import { memo, type ReactNode } from 'react';
import type { ColumnConfig } from '@/types/app';
import { commonCopy } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import TableSkeleton from '@/ui/molecules/TableSkeleton';

type DataTableProps = {
  rows: any[];
  columns: ColumnConfig[];
  loading?: boolean;
  actions?: (item: any) => ReactNode;
};

function DataTable({ rows, columns, loading = false, actions }: DataTableProps) {
  const { language, t } = useLanguage();

  if (loading) {
    return <TableSkeleton columns={columns.length + (actions ? 1 : 0)} />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {t(column.label)}
                </th>
              ))}
              {actions ? <th className="px-4 py-3 font-semibold">{t(commonCopy.actions)}</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {rows.map((item) => (
              <tr key={String(item.id)} className="align-top">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 text-foreground ${column.className || ''}`}>
                    {column.render ? column.render(item, language) : String(item[column.key] ?? '')}
                  </td>
                ))}
                {actions ? <td className="px-4 py-3">{actions(item)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(DataTable);
