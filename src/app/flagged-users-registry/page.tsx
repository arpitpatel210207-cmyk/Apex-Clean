﻿"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ArchiveRestore,
  Star,
  Trash2,
  AlertTriangle,
  Shield,
  User,
  Clock,
  ChevronRight,
  Check,
  Square,
  RefreshCw,
  MoreHorizontal,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";

type RiskLevel = "critical" | "high" | "medium";
type PlatformSource = "telegram" | "discord" | "4chan";
type Folder = "inbox" | "starred" | "archive" | "spam" | "trash";

type RegistryUser = {
  id: number;
  username: string;
  displayName: string;
  platform: PlatformSource;
  folder: Folder;
  risk: RiskLevel;
  reason: string;
  lastActivity: string;
  summary: string;
  detectedIssues: string[];
  isRead: boolean;
};

const INITIAL_USERS: RegistryUser[] = [
  {
    id: 1,
    username: "drugdealer_22",
    displayName: "Alex Carter",
    platform: "telegram",
    folder: "inbox",
    risk: "critical",
    reason: "Repeated synthetic opioid transaction patterns",
    lastActivity: "2026-02-28 21:42",
    summary:
      "Cross-channel alias match with payment wallet reuse and location overlap across three incidents.",
    detectedIssues: [
      "High-frequency suspicious payments",
      "Keyword cluster linked to illicit supply",
      "Network overlap with 2 previously flagged accounts",
    ],
    isRead: false,
  },
  {
    id: 2,
    username: "supply_chain_x",
    displayName: "Maya Johnson",
    platform: "discord",
    folder: "inbox",
    risk: "high",
    reason: "Distribution coordination language in private servers",
    lastActivity: "2026-02-28 18:05",
    summary:
      "Conversation snippets indicate logistical planning with repeated drop-point references.",
    detectedIssues: [
      "Encrypted invite circulation",
      "Suspicious role assignment behavior",
      "Frequent handle-switching pattern",
    ],
    isRead: false,
  },
  {
    id: 3,
    username: "darkmarket_admin",
    displayName: "Unknown",
    platform: "4chan",
    folder: "inbox",
    risk: "high",
    reason: "Potential marketplace moderation and vendor shielding",
    lastActivity: "2026-02-27 23:13",
    summary:
      "Moderation actions suggest coordinated effort to hide vendor contact details while preserving access.",
    detectedIssues: [
      "Thread manipulation signals",
      "Recurring anonymous signature style",
      "Links to known marketplace mirrors",
    ],
    isRead: true,
  },
  {
    id: 4,
    username: "route_drop88",
    displayName: "Noah Reed",
    platform: "telegram",
    folder: "inbox",
    risk: "medium",
    reason: "Logistics chatter with possible coded phrasing",
    lastActivity: "2026-02-27 17:29",
    summary:
      "Repeated references to route and timing in chats with two flagged clusters.",
    detectedIssues: [
      "Contact graph proximity to high-risk account",
      "Possible coded schedule language",
    ],
    isRead: true,
  },
  {
    id: 5,
    username: "signal_runner",
    displayName: "Priya Nair",
    platform: "discord",
    folder: "starred",
    risk: "medium",
    reason: "Historical suspicious links, now inactive",
    lastActivity: "2026-02-20 11:04",
    summary:
      "Case closed after inactivity period and no corroborating activity in connected channels.",
    detectedIssues: ["Legacy suspicious content markers", "No active escalation indicators"],
    isRead: true,
  },
  {
    id: 6,
    username: "darknet_vendor_99",
    displayName: "Unknown",
    platform: "telegram",
    folder: "archive",
    risk: "critical",
    reason: "Active darknet marketplace vendor",
    lastActivity: "2026-02-15 09:30",
    summary:
      "Verified vendor with multiple product listings and positive feedback scores.",
    detectedIssues: [
      "Multiple cryptocurrency wallet addresses",
      "International shipping references",
      "Encrypted communication channels",
    ],
    isRead: true,
  },
];

const NOTIFIED_STORAGE_KEY = "apex_notified_user_ids";

// Gmail-like folder configuration
const FOLDERS: Array<{ key: Folder; label: string; icon: React.ReactNode; color: string }> = [
  { key: "inbox", label: "Inbox", icon: <Send size={18} />, color: "text-cyan-400" },
  { key: "starred", label: "Starred", icon: <Star size={18} />, color: "text-amber-400" },
  { key: "archive", label: "Archive", icon: <Archive size={18} />, color: "text-slate-400" },
  { key: "spam", label: "Spam", icon: <AlertTriangle size={18} />, color: "text-red-400" },
  { key: "trash", label: "Trash", icon: <Trash2 size={18} />, color: "text-slate-400" },
];

export default function FlaggedUsersRegistryPage() {
  const [focusId, setFocusId] = useState<number | null>(null);

  const [users, setUsers] = useState<RegistryUser[]>(INITIAL_USERS);
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(INITIAL_USERS[0]?.id ?? 0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<number[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("focus");
    const parsed = raw ? Number(raw) : NaN;
    setFocusId(Number.isFinite(parsed) ? parsed : null);
  }, []);

  const folderCounts = useMemo(
    () => ({
      inbox: users.filter((u) => u.folder === "inbox").length,
      starred: users.filter((u) => u.folder === "starred").length,
      archive: users.filter((u) => u.folder === "archive").length,
      spam: users.filter((u) => u.folder === "spam").length,
      trash: users.filter((u) => u.folder === "trash").length,
    }),
    [users]
  );

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      if (user.folder !== activeFolder) return false;
      return (
        !q ||
        user.username.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q) ||
        user.reason.toLowerCase().includes(q) ||
        user.summary.toLowerCase().includes(q)
      );
    });
  }, [activeFolder, query, users]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId),
    [users, selectedId]
  );

  useEffect(() => {
    if (focusId === null) return;
    const target = users.find((user) => user.id === focusId);
    if (!target) return;
    setActiveFolder(target.folder);
    setSelectedId(target.id);
  }, [focusId, users]);

  useEffect(() => {
    const syncNotified = () => {
      const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
      if (!raw) {
        setNotifiedIds([]);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as number[];
        setNotifiedIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setNotifiedIds([]);
      }
    };

    syncNotified();
    window.addEventListener("storage", syncNotified);
    window.addEventListener("notified-users-updated", syncNotified as EventListener);
    return () => {
      window.removeEventListener("storage", syncNotified);
      window.removeEventListener("notified-users-updated", syncNotified as EventListener);
    };
  }, []);

  useEffect(() => {
    if (visibleUsers.length === 0) {
      setSelectedId(0);
      return;
    }
    const selectedStillVisible = visibleUsers.some((u) => u.id === selectedId);
    if (!selectedStillVisible) setSelectedId(visibleUsers[0].id);
  }, [visibleUsers, selectedId]);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(new Set(visibleUsers.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [selectAll, visibleUsers]);

  function toggleSelectId(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function moveToFolder(id: number, folder: Folder) {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, folder } : user))
    );
    if (selectedId === id) {
      setSelectedId(visibleUsers[0]?.id ?? 0);
    }
  }

  function bulkMoveToFolder(folder: Folder) {
    setUsers((prev) =>
      prev.map((user) => (selectedIds.has(user.id) ? { ...user, folder } : user))
    );
    setSelectedIds(new Set());
    setSelectAll(false);
  }

  function toggleStar(id: number) {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) return user;
        return {
          ...user,
          folder: user.folder === "starred" ? "inbox" : "starred",
        };
      })
    );
  }

  function deleteMessage(id: number) {
    moveToFolder(id, "trash");
  }

  function markAsRead(id: number) {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, isRead: true } : user))
    );
  }

  function markAsUnread(id: number) {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, isRead: false } : user))
    );
  }

  function getInitials(displayName: string): string {
    if (displayName === "Unknown") return "?";
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarColor(platform: PlatformSource): string {
    switch (platform) {
      case "telegram":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
      case "discord":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-400/40";
      case "4chan":
        return "bg-orange-500/20 text-orange-300 border-orange-400/40";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-400/40";
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-bg p-2 text-text sm:p-3 lg:p-4">
      <div className="mx-auto h-full max-w-[1800px] overflow-hidden">
        {/* Header */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#2a3a45]/60 pb-2 sm:mb-3 sm:pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/track-users"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-2 py-1.5 text-xs font-semibold text-[#d5e9f1] transition hover:bg-[#182433] sm:px-3 sm:py-2"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9cb5c2] sm:text-[11px]">
                Government Portal
              </p>
              <h1 className="page-heading text-xl text-text sm:text-2xl lg:text-[34px]">
                Flagged Users Registry
              </h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              className="input h-9 w-full border-[#2a3a45]/60 bg-[#111a24] px-3 text-sm focus:border-[#355466] focus:ring-0"
            />
          </div>
        </div>

        {/* Gmail-style Three Column Layout */}
        <div className="flex h-[calc(100%-4rem)] min-h-0 overflow-hidden rounded-2xl border border-[#2a3a45]/60 bg-[#0c1219] shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
          
          {/* Left Sidebar - Folders */}
          <aside className="w-[200px] shrink-0 border-r border-[#2a3a45]/60 bg-[#0d151d] overflow-y-auto hidden sm:block">
            <div className="p-2">
              <div className="mb-3 px-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b8294]">
                  Folders
                </h2>
              </div>
              
              <nav className="space-y-0.5">
                {FOLDERS.map((folder) => {
                  const isActive = activeFolder === folder.key;
                  const count = folderCounts[folder.key];
                  
                  return (
                    <button
                      key={folder.key}
                      type="button"
                      onClick={() => setActiveFolder(folder.key)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        isActive
                          ? "bg-[#173041] text-[#d9eff8]"
                          : "text-[#a8c3d2] hover:bg-[#111a24]"
                      }`}
                    >
                      <span className={`${folder.color} ${isActive ? "text-[#d9eff8]" : ""}`}>
                        {folder.icon}
                      </span>
                      <span className="flex-1 text-[13px] font-medium">{folder.label}</span>
                      {count > 0 && (
                        <span className={`text-xs ${isActive ? "text-[#9bc4d6]" : "text-[#6b8294]"}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Risk Legend */}
            <div className="border-t border-[#2a3a45]/60 p-3 mt-2">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b8294]">
                Risk Levels
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#a8c3d2]">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Critical
                </div>
                <div className="flex items-center gap-2 text-xs text-[#a8c3d2]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  High
                </div>
                <div className="flex items-center gap-2 text-xs text-[#a8c3d2]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Medium
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Folder Selector */}
          <div className="sm:hidden border-b border-[#2a3a45]/60 px-2 py-2">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
              {FOLDERS.map((folder) => {
                const isActive = activeFolder === folder.key;
                const count = folderCounts[folder.key];
                
                return (
                  <button
                    key={folder.key}
                    type="button"
                    onClick={() => setActiveFolder(folder.key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                      isActive
                        ? "bg-[#173041] text-[#d9eff8]"
                        : "bg-[#111a24] text-[#a8c3d2]"
                    }`}
                  >
                    <span className={folder.color}>{folder.icon}</span>
                    {folder.label}
                    <span className="text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users..."
                className="input h-9 w-full border-[#2a3a45]/60 bg-[#111a24] px-3 text-sm focus:border-[#355466] focus:ring-0"
              />
            </div>
          </div>

          {/* Middle Column - User List */}
          <div className="flex min-w-0 flex-1 flex-col border-r border-[#2a3a45]/60">
            {/* Action Bar */}
            <div className="flex items-center gap-1 border-b border-[#2a3a45]/60 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setSelectAll(!selectAll)}
                className="rounded p-1.5 text-[#9cb5c2] transition hover:bg-[#223243]"
                title={selectAll ? "Deselect all" : "Select all"}
              >
                {selectAll ? (
                  <Check size={16} className="text-cyan-400" />
                ) : (
                  <Square size={16} />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => bulkMoveToFolder("archive")}
                disabled={selectedIds.size === 0}
                className="rounded p-1.5 text-[#9cb5c2] transition hover:bg-[#223243] disabled:opacity-30"
                title="Archive"
              >
                <Archive size={16} />
              </button>
              
              <button
                type="button"
                onClick={() => bulkMoveToFolder("spam")}
                disabled={selectedIds.size === 0}
                className="rounded p-1.5 text-[#9cb5c2] transition hover:bg-[#223243] disabled:opacity-30"
                title="Report spam"
              >
                <AlertTriangle size={16} />
              </button>
              
              <button
                type="button"
                onClick={() => bulkMoveToFolder("trash")}
                disabled={selectedIds.size === 0}
                className="rounded p-1.5 text-[#ef4444] transition hover:bg-[#3b1c1c] disabled:opacity-30"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex-1" />
              
              <span className="text-xs text-[#7f99a8]">
                {visibleUsers.length} {activeFolder}
              </span>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {visibleUsers.map((user) => {
                const isActive = selectedId === user.id;
                const isStarred = user.folder === "starred";
                const isSelected = selectedIds.has(user.id);
                const isNotified = notifiedIds.includes(user.id);

                return (
                  <div
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedId(user.id);
                      if (!user.isRead) markAsRead(user.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(user.id);
                        if (!user.isRead) markAsRead(user.id);
                      }
                    }}
                    className={`flex w-full min-w-0 items-center gap-2 border-b border-[#1e2b36] px-3 py-2.5 text-left transition cursor-pointer ${
                      isActive ? "bg-[#152332]" : "hover:bg-[#111a24]"
                    } ${!user.isRead ? "bg-[#0f1925]" : ""}`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelectId(user.id);
                      }}
                      className="shrink-0"
                    >
                      {isSelected ? (
                        <Check size={14} className="text-cyan-400" />
                      ) : (
                        <Square size={14} className="text-[#5a7080]" />
                      )}
                    </button>

                    {/* Avatar */}
                    <div
                      className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-semibold ${getAvatarColor(
                        user.platform
                      )}`}
                    >
                      {getInitials(user.displayName)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {/* Risk Indicator */}
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${riskDot(user.risk)}`}
                          aria-hidden="true"
                        />
                        {/* Username */}
                        <span
                          className={`truncate text-[14px] font-medium ${
                            !user.isRead ? "text-[#e6f5fa]" : "text-[#a8c3d2]"
                          }`}
                        >
                          @{user.username}
                        </span>
                        {/* Platform Badge */}
                        <span className="shrink-0 rounded border border-[#2a3a45]/60 bg-[#111a24] px-1.5 py-0.5 text-[10px] text-[#7f99a8]">
                          {user.platform}
                        </span>
                        {isStarred && (
                          <Star size={12} className="shrink-0 text-amber-400 fill-amber-400" />
                        )}
                        {isNotified && (
                          <span className="shrink-0 rounded border border-emerald-400/45 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                            Notified
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[12px] text-[#7f99a8]">
                        <span className="truncate font-medium text-[#a8c3d2]">
                          {user.reason}
                        </span>
                        <span className="shrink-0">-</span>
                        <span className="truncate">{user.summary}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="shrink-0 text-[11px] text-[#7f99a8]">
                      {user.lastActivity}
                    </div>
                  </div>
                );
              })}

              {visibleUsers.length === 0 ? (
                <div className="px-4 py-16 text-center text-sm text-[#9cb5c2]">
                  No users in {activeFolder}.
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column - Detail Panel */}
          <aside className="hidden lg:flex w-[380px] shrink-0 flex-col bg-[#0d151d]">
            {selectedUser ? (
              <>
                {/* Detail Header */}
                <div className="border-b border-[#2a3a45]/60 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border text-xl font-semibold ${getAvatarColor(
                        selectedUser.platform
                      )}`}
                    >
                      {getInitials(selectedUser.displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${riskDot(selectedUser.risk)}`}
                        />
                        <h2 className="text-lg font-semibold text-[#e6f5fa]">
                          @{selectedUser.username}
                        </h2>
                      </div>
                      <p className="text-sm text-[#a8c3d2]">{selectedUser.displayName}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded border border-[#2a3a45]/60 bg-[#111a24] px-2 py-0.5 text-[11px] text-[#7f99a8]">
                          {selectedUser.platform}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${riskBadge(selectedUser.risk)}`}>
                          {selectedUser.risk.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Actions */}
                <div className="flex flex-wrap gap-2 border-b border-[#2a3a45]/60 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleStar(selectedUser.id)}
                    className={`flex items-center gap-1.5 rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-3 py-1.5 text-xs font-medium transition ${
                      selectedUser.folder === "starred"
                        ? "text-amber-400"
                        : "text-[#a8c3d2] hover:bg-[#182433]"
                    }`}
                  >
                    <Star size={14} className={selectedUser.folder === "starred" ? "fill-amber-400" : ""} />
                    {selectedUser.folder === "starred" ? "Starred" : "Star"}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveToFolder(selectedUser.id, "archive")}
                    className="flex items-center gap-1.5 rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-3 py-1.5 text-xs font-medium text-[#a8c3d2] transition hover:bg-[#182433]"
                  >
                    <Archive size={14} />
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMessage(selectedUser.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-[#3b1c1c]"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Reason */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b8294]">
                      <AlertTriangle size={14} />
                      Flag Reason
                    </h3>
                    <p className="text-sm text-[#e6f5fa]">{selectedUser.reason}</p>
                  </div>

                  {/* Summary */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b8294]">
                      <Shield size={14} />
                      Summary
                    </h3>
                    <p className="text-sm text-[#a8c3d2]">{selectedUser.summary}</p>
                  </div>

                  {/* Detected Issues */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b8294]">
                      <Shield size={14} />
                      Detected Issues
                    </h3>
                    <ul className="space-y-2">
                      {selectedUser.detectedIssues.map((issue, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-[#a8c3d2]"
                        >
                          <ChevronRight
                            size={14}
                            className="mt-0.5 shrink-0 text-cyan-400"
                          />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata */}
                  <div className="border-t border-[#2a3a45]/60 pt-4">
                    <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b8294]">
                      <Clock size={14} />
                      Activity
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6b8294]">Last Activity</span>
                        <span className="text-[#a8c3d2]">{selectedUser.lastActivity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b8294]">Status</span>
                        <span className={selectedUser.isRead ? "text-[#6b8294]" : "text-cyan-400"}>
                          {selectedUser.isRead ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#6b8294]">
                Select a user to view details
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function riskDot(level: RiskLevel) {
  if (level === "critical") return "bg-red-400";
  if (level === "high") return "bg-amber-400";
  return "bg-emerald-400";
}

function riskBadge(level: RiskLevel) {
  if (level === "critical") return "bg-red-500/20 text-red-400 border border-red-400/40";
  if (level === "high") return "bg-amber-500/20 text-amber-400 border border-amber-400/40";
  return "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40";
}
