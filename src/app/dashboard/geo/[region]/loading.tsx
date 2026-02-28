import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-[calc(100dvh-128px)] min-h-[420px] w-full sm:h-[calc(100vh-140px)]">
      <Skeleton className="h-full w-full rounded-2xl" />
    </div>
  );
}
