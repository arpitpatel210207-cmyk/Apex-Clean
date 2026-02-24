"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";

type UserRole = "SUPER_ADMIN" | "SUB_ADMIN";

type AdminRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const MOCK_ADMINS: AdminRecord[] = [
  { id: "1", name: "Arpit Patel", email: "arpit.patel@nexus.in", role: "SUPER_ADMIN" },
  { id: "2", name: "Kavya Mehta", email: "kavyaisop@nexus.in", role: "SUB_ADMIN" },
  { id: "3", name: "Rashi Shah", email: "rashishah@nexus.in", role: "SUB_ADMIN" },
  { id: "4", name: "Het Shah", email: "het.shah@nexus.in", role: "SUB_ADMIN" },
];

const roleOptions = [
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Sub Admin", value: "SUB_ADMIN" },
];

export default function EditAdminPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const admin = useMemo(
    () => MOCK_ADMINS.find((item) => item.id === String(params.id)),
    [params.id],
  );

  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [role, setRole] = useState<UserRole>(admin?.role ?? "SUB_ADMIN");

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
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Name</label>
            <input
              className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter admin name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Email</label>
            <input
              type="email"
              className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter admin email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Role</label>
            <Dropdown
              value={role}
              options={roleOptions}
              onChange={(value) => setRole(value as UserRole)}
              placeholder="Select role"
              inputClassName="!border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => router.push("/dashboard/admin")}>
              Cancel
            </Button>
            <Button onClick={() => router.push("/dashboard/admin")}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
