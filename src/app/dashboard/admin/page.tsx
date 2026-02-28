"use client";

import { type ComponentType, type ReactNode, useCallback, useEffect, useRef, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CreateModal } from "@/components/ui/create-modal";
import { Dropdown } from "@/components/ui/dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Eye, Info, Mail, Pencil, Plus, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import {
  createAdmin,
  deleteAdmin,
  getAdmins,
  setAdminStatus,
  type AdminRecord,
  type AdminRole,
} from "@/services/admin";

type Admin = AdminRecord;

type AdminCellCtx = {
  admin: Admin;
  onToggle: () => void;
  onDelete: () => void;
};

type AdminColumn = {
  id: string;
  header: string;
  className?: string;
  cell: (ctx: AdminCellCtx) => ReactNode;
};

type ConfirmState =
  | {
      mode: "toggle";
      adminId: string;
      adminName: string;
      nextStatus: "ACTIVE" | "INACTIVE";
    }
  | {
      mode: "delete";
      adminId: string;
      adminName: string;
    };

function createAdminColumnHelper() {
  return {
    accessor: <K extends keyof Admin>(
      key: K,
      options: {
        header: string;
        className?: string;
        cell?: (value: Admin[K], admin: Admin) => ReactNode;
      },
    ): AdminColumn => ({
      id: String(key),
      header: options.header,
      className: options.className,
      cell: ({ admin }) =>
        options.cell ? options.cell(admin[key], admin) : String(admin[key]),
    }),
    display: (options: {
      id: string;
      header: string;
      className?: string;
      cell: (ctx: AdminCellCtx) => ReactNode;
    }): AdminColumn => ({
      id: options.id,
      header: options.header,
      className: options.className,
      cell: options.cell,
    }),
  };
}

const column = createAdminColumnHelper();

const adminColumns: AdminColumn[] = [
  column.display({
    id: "admin",
    header: "Admin",
    cell: ({ admin }) => {
      const initials = admin.name
        .split(" ")
        .map((n) => n[0])
        .join("");
      return (
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#2f4250]/55 bg-gradient-to-br from-cyan-300/90 to-cyan-500/70 text-sm font-semibold text-[#0f172a]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{admin.name}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-mutetext">
              <Mail size={12} />
              {admin.email}
            </p>
          </div>
        </div>
      );
    },
  }),
  column.accessor("role", {
    header: "Role",
    cell: (value) => (
      <div className="flex items-center">
        <span className="rounded-full border border-[#2f4250]/55 bg-[rgba(111,196,231,0.08)] px-3 py-1 text-xs font-medium text-[#b9deee]">
          {value === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
        </span>
      </div>
    ),
  }),
  column.accessor("created", {
    header: "Created",
    cell: (value) => (
      <span className="text-xs text-mutetext">Created {value || "--"}</span>
    ),
  }),
  column.display({
    id: "status",
    header: "Status",
    className: "text-center",
    cell: ({ admin, onToggle }) => (
      <div className="flex items-center justify-start md:justify-center">
        <Switch checked={admin.status === "ACTIVE"} onChange={onToggle} />
      </div>
    ),
  }),
  column.display({
    id: "actions",
    header: "",
    className: "text-right",
    cell: ({ admin, onDelete }) => (
      <div className="flex items-center justify-start gap-3 md:justify-end">
        <Link
          href={`/dashboard/admin/${admin.id}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-2xl border border-[#2f4250]/55 bg-[rgba(111,196,231,0.14)] px-3 text-xs font-semibold text-[#b9deee] transition hover:bg-[rgba(111,196,231,0.2)]"
          aria-label={`View details for ${admin.name}`}
        >
          <Eye size={14} />
          Details
        </Link>
        <Link
          href={`/dashboard/admin/${admin.id}/edit`}
          className="inline-flex h-9 w-11 items-center justify-center rounded-2xl border border-[#2f4250]/55 bg-[rgba(111,196,231,0.14)] text-[#b9deee] transition hover:bg-[rgba(111,196,231,0.2)]"
          aria-label={`Edit ${admin.name}`}
        >
          <Pencil size={16} />
        </Link>
        <button
          onClick={onDelete}
          className="inline-flex h-9 w-11 items-center justify-center rounded-2xl border border-[#5b3035]/55 bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.3)] transition hover:bg-[#dc3a3a] active:scale-[0.98]"
          aria-label={`Delete ${admin.name}`}
        >
          <Trash2 size={20} strokeWidth={2.2} />
        </button>
      </div>
    ),
  }),
];

export default function AdminsPage() {
  const pathname = usePathname();
  const requestIdRef = useRef(0);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [createDraft, setCreateDraft] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "" as "" | AdminRole,
  });
  const [createError, setCreateError] = useState("");

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((admin) => admin.status === "ACTIVE").length;
    const superAdmins = admins.filter((admin) => admin.role === "SUPER_ADMIN").length;
    return { total, active, superAdmins };
  }, [admins]);

  const requestAdmins = useCallback((showLoader: boolean) => {
    const requestId = ++requestIdRef.current;
    if (showLoader) setLoading(true);

    getAdmins()
      .then((items) => {
        if (requestId !== requestIdRef.current) return;
        setAdmins(items);
        setPageError("");
      })
      .catch((error: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setPageError(
          error instanceof Error ? error.message : "Failed to load admins.",
        );
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        if (showLoader) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (pathname !== "/dashboard/admin") return;

    const kickoff = window.setTimeout(() => {
      requestAdmins(true);
    }, 0);

    return () => {
      window.clearTimeout(kickoff);
      requestIdRef.current += 1;
    };
  }, [pathname, requestAdmins]);

  useEffect(() => {
    if (pathname !== "/dashboard/admin") return;

    const onFocus = () => {
      requestAdmins(false);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      requestAdmins(false);
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname, requestAdmins]);

  useEffect(() => {
    if (pathname !== "/dashboard/admin") return;
    if (!loading || admins.length > 0) return;

    const retry = window.setTimeout(() => {
      requestAdmins(true);
    }, 1800);

    return () => window.clearTimeout(retry);
  }, [pathname, loading, admins.length, requestAdmins]);

  async function toggleStatus(id: string, nextStatus: Admin["status"]) {
    const updated = await setAdminStatus(id, nextStatus);
    setAdmins((prev) => prev.map((admin) => (admin.id === id ? updated : admin)));
  }

  async function removeAdmin(id: string) {
    await deleteAdmin(id);
    setAdmins((prev) => prev.filter((admin) => admin.id !== id));
  }

  async function addAdmin() {
    const name = createDraft.name.trim();
    const email = createDraft.email.trim();
    const mobile = createDraft.mobile.trim();
    const { password, confirmPassword, role } = createDraft;

    if (!name || !email || !mobile || !password || !confirmPassword || !role) {
      setCreateError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setCreateError("Password and confirm password must match.");
      return;
    }

    try {
      const created = await createAdmin({
        name,
        email,
        password,
        role,
        mobile,
      });
      setAdmins((prev) => [...prev, created]);
      setCreateOpen(false);
      setCreateDraft({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
      setCreateError("");
    } catch (error: unknown) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create admin.",
      );
    }
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    try {
      if (confirmState.mode === "toggle") {
        await toggleStatus(confirmState.adminId, confirmState.nextStatus);
      } else {
        await removeAdmin(confirmState.adminId);
      }
      setConfirmState(null);
      setPageError("");
    } catch (error: unknown) {
      setPageError(
        error instanceof Error ? error.message : "Action failed. Try again.",
      );
    }
  }

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="page-heading">Admins</h1>
            <p className="mt-2 text-[14px] text-mutetext">
              Manage system administrators and access levels
            </p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Total Admins" value={stats.total} icon={Users} />
              <StatCard label="Active Admins" value={stats.active} icon={ShieldCheck} />
              <StatCard label="Super Admins" value={stats.superAdmins} icon={UserCog} />
            </>
          )}
        </div>

        <Card className="overflow-hidden border border-[#2a3a45]/55 bg-card">
          <div className="flex items-center justify-between border-b border-[#2a3a45]/35 px-3 py-3 sm:px-5 sm:py-4">
            <span className="text-sm font-semibold text-text"></span>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Add Admin
            </Button>
          </div>

          {pageError ? (
            <CardContent className="pt-4 pb-0 text-sm text-rose-300">
              {pageError}
            </CardContent>
          ) : null}
          <div className="space-y-3 p-3 md:hidden">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => <AdminMobileCardSkeleton key={index} />)
              : admins.map((admin) => (
                  <AdminMobileCard
                    key={admin.id}
                    admin={admin}
                    onToggle={() => {
                      const nextStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                      setConfirmState({
                        mode: "toggle",
                        adminId: admin.id,
                        adminName: admin.name,
                        nextStatus,
                      });
                    }}
                    onDelete={() => {
                      setConfirmState({
                        mode: "delete",
                        adminId: admin.id,
                        adminName: admin.name,
                      });
                    }}
                  />
                ))}
          </div>
          
          <div className="hidden md:grid md:grid-cols-[2.2fr_1fr_1fr_0.9fr_1fr] border-b border-[#2a3a45]/35 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-mutetext/85 sm:px-5">
            {adminColumns.map((column) => (
              <span key={column.id} className={column.className}>
                {column.header}
              </span>
            ))}
          </div>
          <div className="hidden divide-y divide-[#2a3a45]/35 md:block">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <AdminRowSkeleton key={index} />)
              : admins.map((admin) => (
                  <AdminRow
                    key={admin.id}
                    admin={admin}
                    columns={adminColumns}
                    onToggle={() => {
                      const nextStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                      setConfirmState({
                        mode: "toggle",
                        adminId: admin.id,
                        adminName: admin.name,
                        nextStatus,
                      });
                    }}
                    onDelete={() => {
                      setConfirmState({
                        mode: "delete",
                        adminId: admin.id,
                        adminName: admin.name,
                      });
                    }}
                  />
                ))}
          </div>
          {!loading && admins.length === 0 ? (
            <CardContent className="py-10 text-center text-sm text-mutetext">
              No admins found.
            </CardContent>
          ) : null}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmState !== null}
        title={
          confirmState?.mode === "delete" ? "Delete Admin?" : "Change Admin Status?"
        }
        description={
          confirmState?.mode === "delete"
            ? `This will remove ${confirmState.adminName} from the admin directory.`
            : `Change ${confirmState?.adminName ?? "this admin"} to ${
                confirmState?.mode === "toggle" ? confirmState.nextStatus : ""
              }?`
        }
        confirmLabel={confirmState?.mode === "delete" ? "Delete" : "Confirm"}
        cancelLabel="Cancel"
        confirmTone={confirmState?.mode === "delete" ? "danger" : "default"}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirmAction}
      />

      <CreateModal open={createOpen} title="Add Admin" onClose={() => setCreateOpen(false)}>
        <input
          className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
          placeholder="Name"
          value={createDraft.name}
          onChange={(event) =>
            setCreateDraft((prev) => ({ ...prev, name: event.target.value }))
          }
        />
        <input
          type="email"
          className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
          placeholder="Email"
          value={createDraft.email}
          onChange={(event) =>
            setCreateDraft((prev) => ({ ...prev, email: event.target.value }))
          }
        />
        <input
          type="password"
          className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
          placeholder="Password"
          value={createDraft.password}
          onChange={(event) =>
            setCreateDraft((prev) => ({ ...prev, password: event.target.value }))
          }
        />
         <input
          type="password"
          className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
          placeholder="Confirm Password"
          value={createDraft.confirmPassword}
          onChange={(event) =>
            setCreateDraft((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
        />
        <input
          type="tel"
          className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
          placeholder="Mobile No."
          value={createDraft.mobile}
          onChange={(event) =>
            setCreateDraft((prev) => ({ ...prev, mobile: event.target.value }))
          }
        />
       
        <Dropdown
          value={createDraft.role}
          options={[
            { label: "Super Admin", value: "SUPER_ADMIN" },
            { label: "Sub Admin", value: "SUB_ADMIN" },
          ]}
          placeholder="Select role"
          inputClassName="!border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
          onChange={(value) =>
            setCreateDraft((prev) => ({
              ...prev,
              role: value as AdminRole,
            }))
          }
        />
        {createError ? <p className="text-xs text-rose-300">{createError}</p> : null}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addAdmin}>
            Create Admin
          </Button>
        </div>
      </CreateModal>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  const [countValue, setCountValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startAt = 0;
    const durationMs = 1000;

    const step = (now: number) => {
      if (!startAt) startAt = now;
      const progress = Math.min((now - startAt) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountValue(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <Card className="rounded-2xl border border-border/35 bg-card">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-mutetext">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {countValue.toLocaleString("en-US")}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-border/35 bg-card2/60">
          <Icon size={18} className="text-brand" />
        </span>
      </CardContent>
    </Card>
  );
}

function AdminRow({
  admin,
  columns,
  onToggle,
  onDelete,
}: {
  admin: Admin;
  columns: AdminColumn[];
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <CardContent className="p-3 sm:p-4 md:px-5">
      <div className="grid gap-4 md:grid-cols-[2.2fr_1fr_1fr_0.9fr_1fr] md:items-center">
        {columns.map((column) => (
          <div key={column.id}>{column.cell({ admin, onToggle, onDelete })}</div>
        ))}
      </div>
    </CardContent>
  );
}

function AdminMobileCard({
  admin,
  onToggle,
  onDelete,
}: {
  admin: Admin;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const initials = admin.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <Card className="rounded-2xl border border-[#2a3a45]/55 bg-[#11171f]">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2f4250]/55 bg-gradient-to-br from-cyan-300/90 to-cyan-500/70 text-sm font-semibold text-[#0f172a]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{admin.name}</p>
              <p className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-mutetext">
                <Mail size={12} />
                {admin.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#2a3a45]/45 bg-[rgba(111,196,231,0.05)] px-3 py-2">
          <span className="text-xs text-mutetext">Created {admin.created || "--"}</span>
          <Switch checked={admin.status === "ACTIVE"} onChange={onToggle} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/admin/${admin.id}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#2f4250]/55 bg-[rgba(111,196,231,0.14)] px-3 text-xs font-semibold text-[#b9deee] transition hover:bg-[rgba(111,196,231,0.2)]"
            aria-label={`View details for ${admin.name}`}
          >
            <Info size={14} />
            Details
          </Link>
          <Link
            href={`/dashboard/admin/${admin.id}/edit`}
            className="inline-flex h-9 w-11 items-center justify-center rounded-xl border border-[#2f4250]/55 bg-[rgba(111,196,231,0.14)] text-[#b9deee] transition hover:bg-[rgba(111,196,231,0.2)]"
            aria-label={`Edit ${admin.name}`}
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex h-9 w-11 items-center justify-center rounded-xl border border-[#5b3035]/55 bg-[#ef4444] text-white shadow-[0_10px_24px_rgba(239,68,68,0.3)] transition hover:bg-[#dc3a3a] active:scale-[0.98]"
            aria-label={`Delete ${admin.name}`}
          >
            <Trash2 size={20} strokeWidth={2.2} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

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

function AdminRowSkeleton() {
  return (
    <CardContent className="p-3 sm:p-4 md:px-5">
      <div className="grid gap-4 md:grid-cols-[2.2fr_1fr_1fr_0.9fr_1fr] md:items-center">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-11 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-xl justify-self-end" />
      </div>
    </CardContent>
  );
}

function AdminMobileCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-[#2a3a45]/55 bg-[#11171f]">
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
  );
}
