"use client";

import { useMemo, useState } from "react";
import { MapPin, ShieldAlert, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";

type FlaggedUser = {
  id: number;
  username: string;
  platform: string;
  location: string;
  flaggedAt: string;
};

const FLAGGED_USERS: FlaggedUser[] = [
  {
    id: 1,
    username: "drugdealer_22",
    platform: "Telegram",
    location: "Berlin, Germany",
    flaggedAt: "2025-02-01 14:32",
  },
  {
    id: 2,
    username: "supply_chain_x",
    platform: "Discord",
    location: "New York, USA",
    flaggedAt: "2025-02-02 09:12",
  },
  {
    id: 3,
    username: "darkmarket_admin",
    platform: "4can",
    location: "Unknown",
    flaggedAt: "2025-02-03 21:08",
  },
];

export default function TrackUser() {
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<FlaggedUser | null>(null);

  const platformOptions = [
    { label: "All Platforms", value: "all" },
    { label: "Telegram", value: "telegram" },
    { label: "Discord", value: "discord" },
    { label: "4can", value: "4can" },
  ];

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FLAGGED_USERS.filter((u) => {
      const matchPlatform =
        platform === "all" || u.platform.toLowerCase() === platform;
      const matchQuery =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.platform.toLowerCase().includes(q);
      return matchPlatform && matchQuery;
    });
  }, [platform, query]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="page-heading">Track Flagged Users</h1>
        <p className="mt-2 text-mutetext">
          Monitor flagged users with OSINT-derived location data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TopStat title="Flagged Users" value={filteredUsers.length} tone="red" />
        <TopStat
          title="Unique Platforms"
          value={new Set(filteredUsers.map((u) => u.platform)).size}
          tone="cyan"
        />
        <TopStat title="Locations Tracked" value={filteredUsers.length} tone="green" />
      </div>

      <Card
        className="border p-4"
        style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input h-11 min-w-0 flex-1 sm:min-w-[220px] focus:ring-0"
            placeholder="Search username, platform or location..."
            style={{ borderColor: "rgba(82,82,91,0.35)" }}
          />
          <Dropdown
            value={platform}
            options={platformOptions}
            onChange={setPlatform}
            className="w-full sm:w-48"
            inputClassName="h-11 border-[#2a3a45]/60 focus:border-[#355466]/55 focus:ring-0"
            placeholder="All Platforms"
          />
        </div>
      </Card>

      <div className="space-y-5">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} onOpenLocation={() => setSelectedUser(user)} />
        ))}

        {filteredUsers.length === 0 && (
          <Card
            className="border p-12 text-center text-mutetext"
            style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
          >
            No flagged users found.
          </Card>
        )}
      </div>

      <LocationPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}

/* ---------------- UI ---------------- */

function TopStat({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "red" | "cyan" | "green";
}) {
  const valueColor =
    tone === "red"
      ? "text-red-400"
      : tone === "green"
      ? "text-emerald-300"
      : "text-cyan-300";

  return (
    <Card
      className="border"
      style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
    >
      <CardContent className="p-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-mutetext">
          {title}
        </p>
        <p className={`mt-2 text-[26px] font-bold leading-none ${valueColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function UserCard({
  user,
  onOpenLocation,
}: {
  user: FlaggedUser;
  onOpenLocation: () => void;
}) {
  const platformTone =
    user.platform === "Telegram"
      ? "border-cyan-400/35 bg-cyan-500/10 text-cyan-300"
      : user.platform === "Discord"
      ? "border-indigo-400/35 bg-indigo-500/10 text-indigo-300"
      : "border-orange-400/35 bg-orange-500/10 text-orange-300";

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpenLocation}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpenLocation();
      }}
      className="overflow-hidden border bg-[#0c1219]"
      style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#2a3a45]/60 bg-[#111a24]">
              <ShieldAlert size={18} className="text-cyan-300" />
            </span>

            <div>
              <p className="text-[15px] font-semibold text-text">@{user.username}</p>
              <p className="text-[12px] text-mutetext">Potential risk profile</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2a3a45]/60 bg-[#111a24] px-3 py-1 text-[11px] text-mutetext">
            <Timer size={13} />
            Flagged {user.flaggedAt}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${platformTone}`}>
            {user.platform}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenLocation();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#2a3a45]/60 bg-[#111a24] px-3 py-1 text-[11px] text-text transition hover:bg-[#152130]"
          >
            <MapPin size={13} className="text-mutetext" />
            {user.location}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function LocationPanel({
  user,
  onClose,
}: {
  user: FlaggedUser | null;
  onClose: () => void;
}) {
  if (!user) return null;

  const hasLocation = user.location.toLowerCase() !== "unknown";
  const mapHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(user.location)}&travelmode=driving`;
  const mapEmbedSrc = `https://maps.google.com/maps?hl=en&q=${encodeURIComponent(user.location)}&z=11&iwloc=B&output=embed`;

  return (
    <>
      <button
        aria-label="Close location panel"
        onClick={onClose}
        className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-[2px]"
      />

      <div className="fixed inset-y-0 right-0 z-[130] w-full max-w-5xl p-3 sm:p-4">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#2a3a45]/60 bg-[rgba(12,18,25,0.98)] shadow-[0_20px_55px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-[#2a3a45]/60 px-4 py-3 sm:px-5">
            <h3 className="text-[18px] font-semibold text-text">User Location Panel</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-3 py-1.5 text-xs text-mutetext transition hover:bg-[#152130]"
            >
              Close
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="min-h-[320px] border-b border-[#2a3a45]/60 p-3 sm:p-4 lg:border-b-0 lg:border-r">
              <div className="relative h-full overflow-hidden rounded-xl border border-[#2a3a45]/60 bg-[#0d131c]">
                {hasLocation ? (
                  <iframe
                    title={`Map for ${user.location}`}
                    src={mapEmbedSrc}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="grid h-full place-items-center p-4 text-center text-sm text-mutetext">
                    No reliable location found for this user.
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto p-3 sm:p-4">
              <Card
                className="border bg-[#101824]"
                style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
              >
                <CardContent className="space-y-3 p-4">
                  <p className="text-xs uppercase tracking-[0.06em] text-mutetext">User</p>
                  <p className="text-sm font-semibold text-text">@{user.username}</p>

                  <p className="pt-2 text-xs uppercase tracking-[0.06em] text-mutetext">Platform</p>
                  <p className="text-sm text-text">{user.platform}</p>

                  <p className="pt-2 text-xs uppercase tracking-[0.06em] text-mutetext">Detected Location</p>
                  <p className="text-sm text-text">{user.location}</p>

                  <p className="pt-2 text-xs uppercase tracking-[0.06em] text-mutetext">Flagged At</p>
                  <p className="text-sm text-text">{user.flaggedAt}</p>
                </CardContent>
              </Card>

              {hasLocation ? (
                <div className="mt-4">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-[#172434]"
                  >
                    Open Directions
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
