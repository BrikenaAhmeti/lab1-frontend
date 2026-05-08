import { memo } from 'react';

type RouteSkeletonProps = {
  variant?: 'page' | 'fullscreen';
};

function RouteSkeleton({ variant = 'page' }: RouteSkeletonProps) {
  if (variant === 'fullscreen') {
    return (
      <div
        aria-hidden="true"
        className="grid min-h-screen place-items-center bg-background px-4 py-8"
        data-testid="route-skeleton"
      >
        <div className="w-full max-w-5xl space-y-6">
          <div className="flex justify-end gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 rounded-3xl border border-border bg-card p-8">
              <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
              <div className="space-y-3 pt-8">
                <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-muted" />
                <div className="h-5 w-full animate-pulse rounded-2xl bg-muted" />
                <div className="h-5 w-5/6 animate-pulse rounded-2xl bg-muted" />
              </div>
              <div className="grid gap-3 pt-6 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            </div>
            <div className="space-y-4 rounded-3xl border border-border bg-card p-8">
              <div className="h-8 w-40 animate-pulse rounded-2xl bg-muted" />
              <div className="space-y-4 pt-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
              <div className="h-12 w-full animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="space-y-6" data-testid="route-skeleton">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="w-full max-w-2xl space-y-3">
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-5 w-full animate-pulse rounded-2xl bg-muted" />
          <div className="h-5 w-5/6 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="h-11 w-32 animate-pulse rounded-2xl bg-muted" />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RouteSkeleton);
