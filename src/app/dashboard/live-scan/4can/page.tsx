"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Globe,
  Users,
  Search,
  AlertTriangle,
  ShieldCheck,
  Clock3,
} from "lucide-react";

export default function FourCanLiveScanPage() {
  const [target, setTarget] = useState("");
  const [apexModel, setApexModel] = useState<"small" | "large">("small");

  return (
    <div className="space-y-6 sm:space-y-7">
      <Card className="relative overflow-hidden border border-[#2a3a45]/55 bg-card p-4 sm:p-5">
        <div className="relative flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#2f4250]/55 bg-[rgba(111,196,231,0.12)]">
              <Globe className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold text-text sm:text-3xl">4chan Monitoring</h2>
              <p className="text-sm text-mutetext">Monitor boards and threads for suspicious activity in real time</p>
            </div>
          </div>
          {/* <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live
          </span> */}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text">
            <Search className="h-4.5 w-4.5 text-brand" />
            Board Monitoring
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.08em] text-mutetext">Apex Model</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApexModel("small")}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  apexModel === "small"
                    ? "border-[#4f6d81]/70 bg-[rgba(111,196,231,0.18)] text-text"
                    : "border-[#2a3a45]/55 bg-[rgba(18,22,28,0.45)] text-mutetext hover:text-text"
                }`}
              >
                Apex Small
              </button>
              <button
                type="button"
                onClick={() => setApexModel("large")}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  apexModel === "large"
                    ? "border-[#4f6d81]/70 bg-[rgba(111,196,231,0.18)] text-text"
                    : "border-[#2a3a45]/55 bg-[rgba(18,22,28,0.45)] text-mutetext hover:text-text"
                }`}
              >
                Apex Large
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="pb-2 text-xs font-medium uppercase tracking-[0.08em] text-mutetext">Board or Thread</label>
            <input
              className="input !border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
              placeholder="Enter board (e.g. /pol/) or thread URL"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>

          <button className="w-full rounded-xl border border-[#4f6d81]/55 bg-[rgba(111,196,231,0.92)] py-2.5 text-sm font-semibold text-[#0f172a] transition hover:brightness-95">
            Start Monitoring
          </button>
        </Card>

        <Card className="space-y-4 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text">
            <Users className="h-4.5 w-4.5 text-brand" />
            Active Watchlist
          </h3>

          <div className="space-y-2">
            <WatchRow name="/pol/" tags="4 keywords" />
            <WatchRow name="/biz/" tags="3 keywords" />
            <WatchRow name="Thread #49392021" tags="2 keywords" />
          </div>

          <div className="rounded-xl border border-[#2a3a45]/45 bg-[rgba(111,196,231,0.06)] px-3 py-2 text-xs text-mutetext">
            New alerts are pushed automatically while monitoring remains active.
          </div>
        </Card>
      </div>

      <Card className="space-y-5 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-text">Scan Results - 4chan</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#2f4250]/50 bg-[rgba(111,196,231,0.1)] px-3 py-1 text-xs text-brand">
            <Clock3 size={12} />
            Updated just now
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          <ResultStat value="1,120" label="Threads Scanned" tone="brand" />
          <ResultStat value="7" label="Threats Detected" tone="danger" />
          <ResultStat value="26" label="Suspicious" tone="warning" />
          <ResultStat value="1,087" label="Clean Threads" tone="success" />
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-[#2f4250]/50 bg-[rgba(111,196,231,0.1)] px-3 py-1 text-brand">
            Scan completed in 0.78s
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-rose-300">
            <AlertTriangle size={14} />
            High Risk Content Found
          </span>
        </div>
      </Card>
    </div>
  );
}

function WatchRow({ name, tags }: { name: string; tags: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2a3a45]/45 bg-[rgba(18,22,28,0.45)] px-3 py-2">
      <span className="text-sm text-text">{name}</span>
      <span className="text-xs text-mutetext">{tags}</span>
    </div>
  );
}

function ResultStat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "brand" | "danger" | "warning" | "success";
}) {
  const toneClass: Record<typeof tone, string> = {
    brand: "text-cyan-300",
    danger: "text-rose-300",
    warning: "text-amber-300",
    success: "text-emerald-300",
  };

  return (
    <Card className="rounded-xl border border-[#2a3a45]/45 bg-card2/45 py-4 text-center">
      <div className={`text-3xl font-bold ${toneClass[tone]}`}>{value}</div>
      <p className="mt-1 text-sm text-mutetext">{label}</p>
    </Card>
  );
}
