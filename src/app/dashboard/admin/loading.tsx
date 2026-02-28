import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-border/35 bg-card">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-36" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <Card className="overflow-hidden border border-[#2a3a45]/55 bg-card">
        <div className="flex items-center justify-between border-b border-[#2a3a45]/35 px-3 py-3 sm:px-5 sm:py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="rounded-2xl border border-[#2a3a45]/55 bg-[#11171f]">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="min-w-0">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-2 h-3 w-44" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-9 w-24 rounded-xl" />
                  <Skeleton className="h-9 w-11 rounded-xl" />
                  <Skeleton className="h-9 w-11 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-[2.2fr_1fr_1fr_0.9fr_1fr] border-b border-[#2a3a45]/35 px-3 py-3 sm:px-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-20" />
          ))}
        </div>
        <div className="hidden divide-y divide-[#2a3a45]/35 md:block">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardContent key={index} className="p-3 sm:p-4 md:px-5">
              <div className="grid gap-4 md:grid-cols-[2.2fr_1fr_1fr_0.9fr_1fr] md:items-center">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-11 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-xl justify-self-end" />
              </div>
            </CardContent>
          ))}
        </div>
      </Card>
    </div>
  );
}
