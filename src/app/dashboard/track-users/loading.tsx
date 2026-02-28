import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TopStatSkeleton() {
  return (
    <Card
      className="border"
      style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
    >
      <CardContent className="p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-8 w-20" />
      </CardContent>
    </Card>
  );
}

function UserCardSkeleton() {
  return (
    <Card
      className="overflow-hidden border bg-[#0c1219]"
      style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-44 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TopStatSkeleton />
        <TopStatSkeleton />
        <TopStatSkeleton />
      </div>

      <Card
        className="border p-4"
        style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-11 min-w-0 flex-1 sm:min-w-[220px]" />
          <Skeleton className="h-11 w-full sm:w-48" />
        </div>
      </Card>

      <div className="space-y-5">
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
      </div>
    </div>
  );
}
