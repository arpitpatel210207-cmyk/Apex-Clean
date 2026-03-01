"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, MapPin, ShieldAlert, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { getApiBaseUrl, requestJson } from "@/services/http";

type FlaggedUser = {
  id: string;
  username: string;
  platform: string;
  location: string;
  flaggedAt: string;
  latitude: number | null;
  longitude: number | null;
};

const NOTIFIED_STORAGE_KEY = "apex_notified_user_ids";
const FLAGGED_USERS_CACHE_KEY = "apex_flagged_users_cache_v1";
const FLAGGED_USERS_ROUTE = "/moderation/flagged-users";
const BASE_URL = getApiBaseUrl();
let flaggedUsersInFlight: Promise<FlaggedUser[]> | null = null;

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown, fallback = ""): string {
  const str = String(value ?? "").trim();
  return str || fallback;
}

function normalizePlatform(value: string): string {
  const lower = value.toLowerCase();
  if (lower === "telegram") return "Telegram";
  if (lower === "discord") return "Discord";
  if (lower === "4chan" || lower === "fourchan") return "4chan";
  return value || "Unknown";
}

function asNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function extractErrorMessage(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    if ("detail" in body && typeof body.detail === "string" && body.detail) {
      return body.detail;
    }
    if ("message" in body && typeof body.message === "string" && body.message) {
      return body.message;
    }
  }
  if (typeof body === "string" && body) return body;
  return status > 0 ? `Request failed with status ${status}` : "Request failed.";
}

async function getFlaggedUsers(): Promise<FlaggedUser[]> {
  if (flaggedUsersInFlight) return flaggedUsersInFlight;

  flaggedUsersInFlight = (async () => {
    const res = await requestJson(
      `${BASE_URL}${FLAGGED_USERS_ROUTE}`,
      {
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
      { timeoutMs: 20000, retries: 2, retryDelayMs: 500 },
    );

    if (!res.ok) {
      throw new Error(extractErrorMessage(res.body, res.status));
    }

    const root = asObject(res.body);
    const data = root.data;
    const rowsRaw =
      (Array.isArray(data) ? data : null) ??
      (Array.isArray(root.items) ? root.items : null) ??
      (Array.isArray(root.results) ? root.results : null) ??
      (Array.isArray(asObject(data).items) ? asObject(data).items : null) ??
      (Array.isArray(asObject(data).results) ? asObject(data).results : null) ??
      [];
    const rows: unknown[] = Array.isArray(rowsRaw) ? rowsRaw : [];

    return rows.map((row, index) => {
      const item = asObject(row);
      const locationObj = asObject(item.location);
      const username =
        asString(
          item.actor_name ??
            item.actorName ??
            item.username ??
            item.user_name ??
            item.userName,
        ) || "unknown_user";
      return {
        id: asString(item._id ?? item.id ?? item.user_id ?? item.userId, `user-${index + 1}`),
        username: username.startsWith("@") ? username.slice(1) : username,
        platform: normalizePlatform(
          asString(
            item.platform ??
              item.platform_key ??
              item.source ??
              item.channel ??
              item.network,
            "Unknown",
          ),
        ),
        location: asString(
          item.detected_location ??
            item.geo ??
            locationObj.name ??
            locationObj.label ??
            item.location_text ??
            item.location ??
            "Unknown",
        ),
        flaggedAt: asString(
          item.flagged_at ?? item.flaggedAt ?? item.created_at ?? item.createdAt ?? "Unknown",
        ),
        latitude: asNumber(
          locationObj.lat ??
            locationObj.latitude ??
            item.lat ??
            item.latitude ??
            item.location_lat ??
            item.locationLat,
        ),
        longitude: asNumber(
          locationObj.lng ??
            locationObj.lon ??
            locationObj.long ??
            locationObj.longitude ??
            item.lng ??
            item.lon ??
            item.long ??
            item.longitude ??
            item.location_lng ??
            item.locationLon,
        ),
      };
    });
  })();

  try {
    return await flaggedUsersInFlight;
  } finally {
    flaggedUsersInFlight = null;
  }
}

export default function TrackUser() {
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<FlaggedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [selectedUser, setSelectedUser] = useState<FlaggedUser | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
  const [notifyingUser, setNotifyingUser] = useState<FlaggedUser | null>(null);
  const [notifyStage, setNotifyStage] = useState<"confirm" | "success">("confirm");
  const isLocationPanelOpen = selectedUser !== null;
  const isNotifyModalOpen = notifyingUser !== null;
  const isOverlayOpen = isLocationPanelOpen || isNotifyModalOpen;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlayViewport, setOverlayViewport] = useState({ top: 0, height: 0 });

  const platformOptions = [
    { label: "All Platforms", value: "all" },
    { label: "Telegram", value: "telegram" },
    { label: "Discord", value: "discord" },
    { label: "4chan", value: "4chan" },
  ];

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchPlatform =
        platform === "all" || u.platform.toLowerCase() === platform;
      const matchQuery =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.platform.toLowerCase().includes(q);
      return matchPlatform && matchQuery;
    });
  }, [platform, query, users]);

  useEffect(() => {
    let hasCachedUsers = false;
    try {
      const cached = localStorage.getItem(FLAGGED_USERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as FlaggedUser[];
        if (Array.isArray(parsed)) {
          setUsers(parsed);
          hasCachedUsers = true;
        }
      }
    } catch {}

    let mounted = true;
    getFlaggedUsers()
      .then((items) => {
        if (!mounted) return;
        setUsers(items);
        try {
          localStorage.setItem(FLAGGED_USERS_CACHE_KEY, JSON.stringify(items));
        } catch {}
        setUsersError("");
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Failed to load flagged users.";
        setUsersError(hasCachedUsers ? "" : message);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingUsers(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown[];
      if (Array.isArray(parsed)) {
        setNotifiedIds(parsed.map((id) => String(id)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOverlayOpen || !containerRef.current) return;

    let parent = containerRef.current.parentElement as HTMLElement | null;
    while (parent) {
      const { overflowY } = window.getComputedStyle(parent);
      if (overflowY === "auto" || overflowY === "scroll") break;
      parent = parent.parentElement;
    }

    if (!parent) return;

    const updateViewport = () => {
      setOverlayViewport({
        top: parent.scrollTop,
        height: parent.clientHeight,
      });
    };

    updateViewport();

    const previousOverflowY = parent.style.overflowY;
    const previousOverscrollBehavior = parent.style.overscrollBehavior;

    parent.style.overflowY = "hidden";
    parent.style.overscrollBehavior = "contain";
    window.addEventListener("resize", updateViewport);

    return () => {
      parent.style.overflowY = previousOverflowY;
      parent.style.overscrollBehavior = previousOverscrollBehavior;
      window.removeEventListener("resize", updateViewport);
    };
  }, [isOverlayOpen]);

  useEffect(
    () => () => {
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    },
    []
  );

  function persistNotified(ids: string[]) {
    setNotifiedIds(ids);
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("notified-users-updated"));
  }

  function openNotifyFlow(user: FlaggedUser) {
    if (notifiedIds.includes(user.id)) return;
    setNotifyingUser(user);
    setNotifyStage("confirm");
  }

  function closeNotifyFlow() {
    if (notifyTimerRef.current) {
      clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = null;
    }
    setNotifyingUser(null);
    setNotifyStage("confirm");
  }

  function confirmNotify() {
    if (!notifyingUser) return;
    if (!notifiedIds.includes(notifyingUser.id)) {
      persistNotified([...notifiedIds, notifyingUser.id]);
    }
    setNotifyStage("success");
    notifyTimerRef.current = setTimeout(() => {
      closeNotifyFlow();
    }, 1400);
  }

  return (
    <div ref={containerRef} className="relative isolate">
      <div
        className={`space-y-6 transition-[filter,opacity] duration-200 sm:space-y-8 ${
          isOverlayOpen ? "pointer-events-none blur-[3px]" : ""
        }`}
        aria-hidden={isOverlayOpen}
      >
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
          {usersError ? (
            <Card
              className="border p-4 text-sm text-rose-300"
              style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
            >
              {usersError}
            </Card>
          ) : null}

          {isLoadingUsers ? (
            <Card
              className="border p-12 text-center text-mutetext"
              style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
            >
              Loading flagged users...
            </Card>
          ) : null}

          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onOpenLocation={() => setSelectedUser(user)}
              onNotifyGovernment={() => openNotifyFlow(user)}
              isNotified={notifiedIds.includes(user.id)}
            />
          ))}

          {!isLoadingUsers && filteredUsers.length === 0 && (
            <Card
              className="border p-12 text-center text-mutetext"
              style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
            >
              No flagged users found.
            </Card>
          )}
        </div>
      </div>

      <LocationPanel
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        overlayTop={overlayViewport.top}
        overlayHeight={overlayViewport.height}
      />

      <NotifyGovernmentModal
        user={notifyingUser}
        stage={notifyStage}
        overlayTop={overlayViewport.top}
        overlayHeight={overlayViewport.height}
        onCancel={closeNotifyFlow}
        onConfirm={confirmNotify}
      />
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
  onNotifyGovernment,
  isNotified,
}: {
  user: FlaggedUser;
  onOpenLocation: () => void;
  onNotifyGovernment: () => void;
  isNotified: boolean;
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

        <div className="flex items-center justify-between gap-3">
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

          <button
            type="button"
            disabled={isNotified}
            onClick={(event) => {
              event.stopPropagation();
              onNotifyGovernment();
            }}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
              isNotified
                ? "cursor-not-allowed border-emerald-400/35 bg-emerald-500/15 text-emerald-200/80"
                : "border-cyan-400/45 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25"
            }`}
          >
            {isNotified ? "Notified" : "Notify Government"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotifyGovernmentModal({
  user,
  stage,
  overlayTop,
  overlayHeight,
  onCancel,
  onConfirm,
}: {
  user: FlaggedUser | null;
  stage: "confirm" | "success";
  overlayTop: number;
  overlayHeight: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!user) return null;

  return (
    <div className="absolute inset-x-0 z-[150]" style={{ top: overlayTop, height: overlayHeight || "100%" }}>
      <button
        aria-label="Close notify modal"
        onClick={onCancel}
        className="absolute inset-0 bg-black/45"
      />

      <div className="absolute left-1/2 top-1/2 z-[1] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-[#2a3a45]/60 bg-[rgba(12,18,25,0.98)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.55)] sm:p-6">
          {stage === "confirm" ? (
            <>
              <h3 className="text-lg font-semibold text-text">Confirm Government Notification</h3>
              <p className="mt-2 text-sm text-mutetext">
                You are about to officially report <span className="font-semibold text-text">@{user.username}</span> to government authorities.
                Do you want to continue?
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-3 py-2 text-xs font-semibold text-mutetext transition hover:bg-[#152130]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="rounded-lg border border-cyan-400/45 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
                >
                  Confirm Submission
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <CheckCircle2 size={56} className="text-emerald-300" />
              <h4 className="mt-3 text-lg font-semibold text-text">Notification Submitted</h4>
              <p className="mt-1 text-sm text-mutetext">
                Flagged user <span className="font-semibold text-text">@{user.username}</span> has been successfully reported to government authorities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LocationPanel({
  user,
  onClose,
  overlayTop,
  overlayHeight,
}: {
  user: FlaggedUser | null;
  onClose: () => void;
  overlayTop: number;
  overlayHeight: number;
}) {
  if (!user) return null;

  const hasCoordinates = user.latitude !== null && user.longitude !== null;
  const hasLocation = hasCoordinates || user.location.toLowerCase() !== "unknown";
  const mapQuery = hasCoordinates ? `${user.latitude},${user.longitude}` : user.location;
  const mapEmbedSrc = `https://maps.google.com/maps?hl=en&q=${encodeURIComponent(mapQuery)}&z=11&iwloc=B&output=embed`;

  return (
    <div
      className="absolute inset-x-0 z-[140]"
      style={{ top: overlayTop, height: overlayHeight || "100%" }}
      onWheel={(event) => event.preventDefault()}
      onTouchMove={(event) => event.preventDefault()}
    >
      <button
        aria-label="Close location panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div className="absolute left-1/2 top-[46%] z-[1] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 sm:w-[calc(100%-2rem)]">
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

            <div className="min-h-0 overflow-hidden p-3 sm:p-4">
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
