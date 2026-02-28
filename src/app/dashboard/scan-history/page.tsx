"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { CreateModal } from "@/components/ui/create-modal";
import { Dropdown } from "@/components/ui/dropdown";
import { AlertTriangle, Clock3, ShieldCheck } from "lucide-react";

/* ---------------- TYPES ---------------- */

type Scan = {
  id: number;
  platform: string;
  type: string;
  target: string;
  messages: number;
  threats: number;
  suspicious: number;
  clean: number;
  risk: "Low" | "High" | "Critical";
  time: string;
  duration: string;
  deltaMessages: string;
  deltaThreats: string;
  deltaSuspicious: string;
  deltaClean: string;
};

/* ---------------- DATA ---------------- */

const SCANS: Scan[] = [
  {
    id: 1,
    platform: "Discord",
    type: "Posts Scan",
    target: "@suspicious_user_1",
    messages: 156,
    threats: 3,
    suspicious: 8,
    clean: 145,
    risk: "High",
    time: "30m ago",
    duration: "2.1s",
    deltaMessages: "+12%",
    deltaThreats: "+2%",
    deltaSuspicious: "-5%",
    deltaClean: "+15%",
  },
  {
    id: 2,
    platform: "Telegram",
    type: "Groups Scan",
    target: "DrugMarket_Channel",
    messages: 1247,
    threats: 15,
    suspicious: 23,
    clean: 1209,
    risk: "Critical",
    time: "2h ago",
    duration: "8.7s",
    deltaMessages: "+9%",
    deltaThreats: "+4%",
    deltaSuspicious: "-2%",
    deltaClean: "+11%",
  },
  {
    id: 3,
    platform: "4can",
    type: "File Scan",
    target: "group_chat_export.txt",
    messages: 89,
    threats: 0,
    suspicious: 2,
    clean: 87,
    risk: "Low",
    time: "4h ago",
    duration: "1.3s",
    deltaMessages: "+5%",
    deltaThreats: "0%",
    deltaSuspicious: "-1%",
    deltaClean: "+7%",
  },
];
const platformOptions = [
  { label: "All Platforms", value: "all" },
  { label: "Discord", value: "discord" },
  { label: "Telegram", value: "telegram" },
  { label: "4can", value: "4can" },
];
/* ======================================================= */

export default function ScanHistory() {
  const [openExport, setOpenExport] = useState(false);
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");

  const filteredScans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCANS.filter((scan) => {
      const matchPlatform =
        platform === "all" || scan.platform.toLowerCase() === platform;
      const matchQuery =
        !q ||
        scan.platform.toLowerCase().includes(q) ||
        scan.type.toLowerCase().includes(q) ||
        scan.target.toLowerCase().includes(q);
      return matchPlatform && matchQuery;
    });
  }, [platform, query]);

  const totalScans = filteredScans.length;
  const totalThreats = filteredScans.reduce((s, x) => s + x.threats, 0);
  const totalMessages = filteredScans.reduce((s, x) => s + x.messages, 0);
  const totalClean = filteredScans.reduce((s, x) => s + x.clean, 0);
  const successRate = totalMessages ? Math.round((totalClean / totalMessages) * 100) : 0;
  return (
    <div className="space-y-6 sm:space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="page-heading">Scan History</h1>
        <p className="mt-2 text-[14px] text-mutetext">
          Review and manage previous detection scans
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-5 lg:gap-6">
        <Stat title="Total Scans" value={totalScans} />
        <Stat title="Threats Found" value={totalThreats} danger />
        <Stat title="Analyzed" value={totalMessages} />
        <Stat title="Success Rate" value={`${successRate}%`} success />
      </div>

      {/* FILTER BAR */}
      <Card
        className="flex flex-wrap items-center gap-3 border p-3 sm:gap-4 sm:p-4"
        style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
      >

     <input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  className="input min-w-0 flex-1 sm:min-w-[160px] focus:ring-0"
  placeholder="Search scans..."
  style={{ borderColor: "rgba(82,82,91,0.35)" }}
/>



<Dropdown
  value={platform}
  options={platformOptions}
  onChange={setPlatform}
  className="w-full sm:w-44"
  inputClassName="border-[#2a3a45]/60 bg-[#0c141d] focus:border-[#355466]/55 focus:ring-0"
  placeholder="All Platforms"
/>


     


        <button
          onClick={() => setOpenExport(true)}
          className="w-full rounded-xl border border-[#6fc4e7]/60 bg-[#6fc4e7] px-4 py-2.5 font-medium text-[#121212] transition hover:opacity-90 sm:w-auto sm:px-6 sm:py-3"
        >
          Export
        </button>
      </Card>

      {/* SCAN CARDS */}
      <div className="space-y-4 sm:space-y-6">
        {filteredScans.map(scan => (
          <ScanCard
            key={scan.id}
            scan={scan}
            onExport={() => setOpenExport(true)}
          />
        ))}
        {filteredScans.length === 0 ? (
          <Card
            className="border"
            style={{ borderColor: "rgba(82,82,91,0.35)", boxShadow: "none" }}
          >
            <CardContent className="py-10 text-center text-sm text-mutetext">
              No scans found for selected platform.
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* EXPORT MODAL */}
     <CreateModal
  open={openExport}
  onClose={() => setOpenExport(false)}
  title="Export Scan Data"
>
  <ExportRow label="JSON Format" />
  <ExportRow label="CSV Format" />
  <ExportRow label="PDF Format" />
</CreateModal>


    </div>
  );
}

/* ======================================================= */
/* COMPONENTS                                             */
/* ======================================================= */

function Stat({
  title,
  value,
  danger,
  success,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
  success?: boolean;
}) {
  const valueColor = danger
    ? "text-red-400"
    : success
    ? "text-emerald-300"
    : "text-cyan-300";

  const borderColor = "rgba(82,82,91,0.35)";

  return (
    <Card
      className="p-6 flex justify-between items-center border"
      style={{ borderColor, boxShadow: "none" }}
    >
      <div>
        <p className="text-[12px] font-medium tracking-[0.04em] text-mutetext">{title}</p>

        <p className={`mt-1 text-[22px] font-bold leading-none tabular-nums sm:text-[26px] ${valueColor}`}>
          {value}
        </p>
      </div>

      <div className="h-12 w-12 rounded-xl bg-card2" />
    </Card>
  );
}

/* ---------------- SCAN CARD ---------------- */

function ScanCard({
  scan,
  onExport,
}: {
  scan: Scan;
  onExport: () => void;
}) {
  return (
    <Card
      className="relative overflow-hidden border border-[#2a3a45]/45 bg-[#0c1219]"
      style={{ boxShadow: "none" }}
    >

      <CardContent className="space-y-4 p-5">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#2a3a45]/55 bg-[#111a24] text-cyan-400">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold tracking-[0.01em] text-cyan-400">
                Scan Results - {scan.platform}
              </h3>
              <p className="text-[12px] text-mutetext">
                {scan.target} • {scan.type}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#2a3a45]/60 bg-[#131d2a] px-3.5 py-1.5 text-[11px] font-semibold text-slate-300">
            <Clock3 size={13} />
            Last scan: {scan.time}
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <GlassStat label="MESSAGES SCANNED" value={scan.messages} color="brand" />
          <GlassStat label="THREATS DETECTED" value={scan.threats} color="danger" />
          <GlassStat label="SUSPICIOUS ACTIVITY" value={scan.suspicious} color="warning" />
          <GlassStat label="CLEAN RECORDS" value={scan.clean} color="success" />
        </div>

        {/* FOOTER */}
        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <span className="inline-flex items-center rounded-full border border-[#2a3a45]/60 bg-[#131d2a] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-200">
            Scan completed in {scan.duration}
          </span>

          {scan.threats > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/35 bg-red-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-red-400">
              <AlertTriangle size={13} />
              Active threat detected
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-emerald-400">
              No active threat
            </span>
          )}

          <div className="ml-auto">
            <button
              onClick={onExport}
              className="rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-4 py-1.5 text-[11px] font-semibold text-text transition hover:bg-[#172434]"
            >
              Export
            </button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

/* ---------------- GLASS STAT ---------------- */

function GlassStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "brand" | "danger" | "warning" | "success";
}) {

  const textColors = {
    brand: "text-cyan-300",
    danger: "text-red-400",
    warning: "text-yellow-300",
    success: "text-emerald-300",
  };

  return (
    <div
      className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center backdrop-blur-xl"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
    >
      <div className="flex items-end justify-center gap-2">
        <p className={`text-[28px] font-extrabold leading-none tabular-nums sm:text-[36px] ${textColors[color]}`}>
          {value}
        </p>
      </div>
      <p className="mt-3 text-[10px] font-extrabold tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ---------------- EXPORT ROW ---------------- */

function ExportRow({ label }: { label: string }) {
  return (
    <div className="modal-surface mb-3 flex items-center justify-between rounded-xl px-4 py-3">
      <span className="text-[14px] font-medium">
        {label}
      </span>

      <button className="modal-primary rounded-lg px-4 py-1.5 font-semibold transition hover:brightness-110">
        Export
      </button>
    </div>
  );
}
