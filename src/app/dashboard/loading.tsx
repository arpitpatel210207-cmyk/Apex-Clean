import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden rounded-2xl bg-card px-5 py-5 shadow-soft min-h-[120px]">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-[rgba(174,222,241,0.35)]" />
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-9 w-28 rounded" />
    </Card>
  );
}

function PlatformCardSkeleton() {
  return (
    <Card className="relative min-h-[280px] min-w-0 flex-1 rounded-2xl border border-border/70 bg-card p-6">
      <div className="flex h-full flex-col space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-44 rounded" />
        </div>

        <div className="rounded-xl border border-[rgba(0,0,0,0.78)] bg-[rgb(12,12,12)] px-3 py-3 shadow-[inset_6px_6px_14px_rgba(0,0,0,0.86),inset_-2px_-2px_6px_rgba(255,255,255,0.08),0_1px_0_rgba(0,0,0,0.62)]">
          <div className="flex h-32 items-end gap-1.5 rounded-lg px-0.5">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full rounded-full"
                style={{ height: `${35 + index * 8}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center gap-2 px-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-2 w-full rounded" />
            ))}
          </div>
        </div>

        <Skeleton className="mt-auto h-4 w-32 rounded" />
      </div>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <Skeleton className="h-11 w-48 rounded-md" />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 py-2 sm:py-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <PlatformCardSkeleton key={index} />
        ))}
      </div>

      <Card className="rounded-2xl bg-card p-5 min-h-[360px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-56 rounded" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
