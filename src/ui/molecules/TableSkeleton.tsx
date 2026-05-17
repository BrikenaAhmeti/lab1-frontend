type TableSkeletonProps = {
  columns?: number;
  rows?: number;
};

export default function TableSkeleton({
  columns = 5,
  rows = 5,
}: TableSkeletonProps) {
  const columnCount = Math.max(columns, 1);

  return (
    <div aria-hidden="true" className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div
            className="grid gap-4 border-b border-border bg-muted/60 px-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columnCount }).map((_, index) => (
              <div key={index} className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
            ))}
          </div>

          <div className="divide-y divide-border/80">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-4 px-4 py-4"
                style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columnCount }).map((__, columnIndex) => (
                  <div
                    key={columnIndex}
                    className="h-4 animate-pulse rounded-full bg-muted"
                    style={{
                      width: `${Math.max(42, 78 - ((rowIndex + columnIndex) % 3) * 12)}%`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
