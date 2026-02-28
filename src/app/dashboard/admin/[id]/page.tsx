"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminById, type AdminRecord } from "@/services/admin";

export default function AdminDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getAdminById(String(params.id))
      .then((record) => {
        if (!isMounted) return;
        if (!record) {
          setError("Admin not found.");
          return;
        }
        setAdmin(record);
      })
      .catch((apiError: unknown) => {
        if (!isMounted) return;
        setError(
          apiError instanceof Error
            ? apiError.message
            : "Failed to load admin details.",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (loading) {
    return <AdminDetailsSkeleton />;
  }

  if (!admin || error) {
    return (
      <Card className="max-w-2xl border border-[#2a3a45]/55 bg-card">
        <CardContent className="space-y-4 p-6">
          <h1 className="page-heading">Admin Details</h1>
          <p className="text-sm text-mutetext">{error || "Admin not found."}</p>
          <Button onClick={() => router.push("/dashboard/admin")}>Back to Admins</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">Admin Details</h1>
          <p className="mt-2 text-[14px] text-mutetext">
            View complete admin information
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/dashboard/admin")}>
          Back
        </Button>
      </div>

      <Card className="max-w-2xl border border-[#2a3a45]/55 bg-card">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <DetailItem label="Name" value={admin.name} />
          <DetailItem
            label="Role"
            value={admin.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
          />
          <DetailItem label="Mobile No." value={admin.mobile} />
          <DetailItem label="Email" value={admin.email} />
          <DetailItem
            label="Status"
            value={admin.status}
            valueClassName={
              admin.status === "ACTIVE" ? "text-emerald-300" : "text-rose-300"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDetailsSkeleton() {
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
          <DetailItemSkeleton />
          <DetailItemSkeleton />
          <DetailItemSkeleton />
          <DetailItemSkeleton />
          <DetailItemSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItemSkeleton() {
  return (
    <div className="rounded-xl border border-[#2a3a45]/45 bg-[rgba(111,196,231,0.04)] p-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-4 w-28" />
    </div>
  );
}

function DetailItem({
  label,
  value,
  valueClassName = "text-text",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-[#2a3a45]/45 bg-[rgba(111,196,231,0.04)] p-3">
      <p className="text-xs uppercase tracking-[0.06em] text-mutetext">{label}</p>
      <p className={`mt-1 text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}
