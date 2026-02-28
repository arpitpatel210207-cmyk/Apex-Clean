import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>

      <Card className="max-w-2xl border border-[#2a3a45]/55 bg-card">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#2a3a45]/45 bg-[rgba(111,196,231,0.04)] p-3"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
