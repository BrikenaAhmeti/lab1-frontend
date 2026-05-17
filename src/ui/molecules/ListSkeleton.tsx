import clsx from 'clsx';

type ListSkeletonProps = {
  items?: number;
  itemClassName?: string;
  className?: string;
};

export default function ListSkeleton({
  items = 3,
  itemClassName,
  className,
}: ListSkeletonProps) {
  return (
    <div aria-hidden="true" className={clsx('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className={clsx('h-16 animate-pulse rounded-2xl bg-muted', itemClassName)}
        />
      ))}
    </div>
  );
}
