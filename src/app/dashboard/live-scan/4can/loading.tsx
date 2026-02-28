import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-7">
      <Card className="border border-[#2a3a45]/55 bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0">
              <Skeleton className="h-9 w-72 max-w-full" />
              <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </Card>

        <Card className="space-y-4 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </Card>
      </div>

      <Card className="space-y-5 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-44 rounded-full" />
          <Skeleton className="h-7 w-48 rounded-full" />
        </div>
      </Card>
    </div>
  );
}
