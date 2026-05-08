import { memo } from 'react';
import Button from '@/ui/atoms/Button';
import Select from '@/ui/atoms/Select';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  limitOptions: number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

function Pagination({
  page,
  totalPages,
  total,
  limit,
  limitOptions,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card px-4 py-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">
          {t(commonCopy.totalRecords)}: {total}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(commonCopy.pageSummary)} {page} / {Math.max(totalPages, 1)}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-40">
          <Select
            label={t(commonCopy.rowsPerPage)}
            value={String(limit)}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t(commonCopy.previous)}
          </Button>
          <Button
            variant="outline"
            disabled={totalPages <= 1 || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t(commonCopy.next)}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(Pagination);
