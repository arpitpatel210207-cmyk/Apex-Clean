"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import {
  getAdminById,
  patchAdmin,
  type AdminRole,
  type AdminStatus,
} from "@/services/admin";

const roleOptions = [
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Sub Admin", value: "SUB_ADMIN" },
];

export default function EditAdminPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("SUB_ADMIN");
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState<AdminStatus>("ACTIVE");

  useEffect(() => {
    let isMounted = true;

    getAdminById(String(params.id))
      .then((admin) => {
        if (!isMounted) return;
        if (!admin) {
          setError("Admin not found.");
          return;
        }
        setName(admin.name);
        setEmail(admin.email);
        setRole(admin.role);
        setMobile(admin.mobile);
        setStatus(admin.status);
      })
      .catch((apiError: unknown) => {
        if (!isMounted) return;
        setError(
          apiError instanceof Error ? apiError.message : "Failed to load admin.",
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

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await patchAdmin(String(params.id), {
        name: name.trim(),
        email: email.trim(),
        role,
        mobile: mobile.trim(),
        status,
      });
      router.push("/dashboard/admin");
    } catch (apiError: unknown) {
      setError(
        apiError instanceof Error ? apiError.message : "Failed to update admin.",
      );
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Edit Admin</h1>
        <p className="mt-2 text-[14px] text-mutetext">
          Update admin details and access role
        </p>
      </div>

      <Card className="max-w-2xl border border-[#2a3a45]/55 bg-card">
        <CardContent className="space-y-4 p-6">
          {loading ? <p className="text-sm text-mutetext">Loading admin...</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Name</label>
            <input
              className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
              value={name}
              readOnly
              disabled
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Email</label>
            <input
              type="email"
              className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
              value={email}
              readOnly
              disabled
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Role</label>
            <Dropdown
              value={role}
              options={roleOptions}
              onChange={(value) => setRole(value as AdminRole)}
              placeholder="Select role"
              inputClassName="!border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/admin")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
