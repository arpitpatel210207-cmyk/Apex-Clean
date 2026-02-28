"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { CreateModal } from "@/components/ui/create-modal";
import { Dropdown } from "@/components/ui/dropdown";
import { AlertTriangle, Clock3, ShieldCheck } from "lucide-react";
import {
  exportScanHistory,
  getScanHistoryOverviewList,
  getScanHistorySummary,
  type ScanHistoryExportType,
  type ScanHistoryOverviewItem,
  type ScanHistorySummary,
} from "@/services/scan-history";

/* ---------------- TYPES ---------------- */

type Scan = {
  id: string;
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
  activeThreat?: boolean;
};

const platformOptions = [
  { label: "All Platforms", value: "all" },
  { label: "Discord", value: "discord" },
  { label: "Telegram", value: "telegram" },
  { label: "4chan", value: "4chan" },
];
/* ======================================================= */

export default function ScanHistory() {
  const [openExport, setOpenExport] = useState(false);
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<ScanHistorySummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [scans, setScans] = useState<Scan[]>([]);
  const [exportingType, setExportingType] = useState<ScanHistoryExportType | null>(null);
  const [exportError, setExportError] = useState("");

  const filteredScans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scans.filter((scan) => {
      const matchPlatform =
        platform === "all" || scan.platform.toLowerCase() === platform;
      const matchQuery =
        !q ||
        scan.platform.toLowerCase().includes(q) ||
        scan.type.toLowerCase().includes(q) ||
        scan.target.toLowerCase().includes(q);
      return matchPlatform && matchQuery;
    });
  }, [platform, query, scans]);

  const totalScans = filteredScans.length;
  const totalThreats = filteredScans.reduce((s, x) => s + x.threats, 0);
  const totalMessages = filteredScans.reduce((s, x) => s + x.messages, 0);
  const totalClean = filteredScans.reduce((s, x) => s + x.clean, 0);
  const successRate = totalMessages ? Math.round((totalClean / totalMessages) * 100) : 0;

  useEffect(() => {
    let mounted = true;
    getScanHistorySummary()
      .then((data) => {
        if (!mounted) return;
        setSummary(data);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setSummaryError(
          error instanceof Error ? error.message : "Failed to load summary.",
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    getScanHistoryOverviewList()
      .then((items: ScanHistoryOverviewItem[]) => {
        if (!mounted) return;
        setScans(
          items.map((item) => ({
            id: item.scanId,
            platform: item.platform,
            type: "Overview",
            target: item.scrapes,
            messages: item.messagesScanned,
            threats: item.threatsDetected,
            suspicious: item.suspicious,
            clean: item.cleanRecords,
            risk: item.activeThreat ? "High" : "Low",
            time: item.lastScanAgo,
            duration: `${item.scanCompletedSecs}s`,
            deltaMessages: "0%",
            deltaThreats: "0%",
            deltaSuspicious: "0%",
            deltaClean: "0%",
            activeThreat: item.activeThreat,
          })),
        );
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setOverviewError(
          error instanceof Error ? error.message : "Failed to load scan history list.",
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleExport(type: ScanHistoryExportType) {
    setExportError("");
    setExportingType(type);
    try {
      const file = await exportScanHistory(type);
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setOpenExport(false);
    } catch (error: unknown) {
      setExportError(
        error instanceof Error ? error.message : `Failed to export ${type.toUpperCase()}`,
      );
    } finally {
      setExportingType(null);
    }
  }
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
        <Stat title="Total Scans" value={summary?.totalScans ?? totalScans} />
        <Stat title="Threats Found" value={summary?.threatsFound ?? totalThreats} danger />
        <Stat title="Analyzed" value={summary?.analyzed ?? totalMessages} />
        <Stat title="Success Rate" value={`${summary?.successRate ?? successRate}%`} success />
      </div>
      {summaryError ? <p className="text-sm text-rose-300">{summaryError}</p> : null}
      {overviewError ? <p className="text-sm text-rose-300">{overviewError}</p> : null}

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
  <ExportRow
    label="JSON Format"
    loading={exportingType === "json"}
    onExport={() => handleExport("json")}
  />
  <ExportRow
    label="CSV Format"
    loading={exportingType === "csv"}
    onExport={() => handleExport("csv")}
  />
  <ExportRow
    label="PDF Format"
    loading={exportingType === "pdf"}
    onExport={() => handleExport("pdf")}
  />
  {exportError ? <p className="text-xs text-rose-300">{exportError}</p> : null}
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
}: {
  scan: Scan;
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

          {scan.activeThreat || scan.threats > 0 ? (
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
            {/* <button
              onClick={onExport}
              className="rounded-lg border border-[#2a3a45]/60 bg-[#111a24] px-4 py-1.5 text-[11px] font-semibold text-text transition hover:bg-[#172434]"
            >
              Export
            </button> */}
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

function ExportRow({
  label,
  onExport,
  loading = false,
}: {
  label: string;
  onExport: () => void;
  loading?: boolean;
}) {
  return (
    <div className="modal-surface mb-3 flex items-center justify-between rounded-xl px-4 py-3">
      <span className="text-[14px] font-medium">
        {label}
      </span>

      <button
        onClick={onExport}
        disabled={loading}
        className="modal-primary rounded-lg px-4 py-1.5 font-semibold transition hover:brightness-110 disabled:opacity-70"
      >
        {loading ? "Exporting..." : "Export"}
      </button>
    </div>
  );
}
