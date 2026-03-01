"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { toast } from "sonner";
import {
  getDiscordChannels,
  scrapeDiscord,
  type DiscordChannel,
} from "@/services/discord";
import {
  getScanHistoryOverviewList,
  type ScanHistoryOverviewItem,
} from "@/services/scan-history";
import {
  MessageCircle,
  Users,
  AlertTriangle,
  ShieldCheck,
  Search,
  Clock3,
} from "lucide-react";

export default function DiscordLiveScanPage() {
  const [target, setTarget] = useState("");
  const [apexModel, setApexModel] = useState<"small" | "large">("small");
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [latestDiscordHistory, setLatestDiscordHistory] = useState<ScanHistoryOverviewItem | null>(
    null,
  );
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getDiscordChannels()
      .then((items) => {
        if (!mounted) return;
        setChannels(items);
        setChannelsError(null);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Failed to load Discord channels.";
        setChannelsError(message);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingChannels(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    getScanHistoryOverviewList()
      .then((items) => {
        if (!mounted) return;
        const discordItems = items
          .filter((item) => item.platform.toLowerCase() === "discord")
          .sort((a, b) => {
            const aTs = Date.parse(a.lastScanAt || "");
            const bTs = Date.parse(b.lastScanAt || "");
            return (Number.isFinite(bTs) ? bTs : 0) - (Number.isFinite(aTs) ? aTs : 0);
          })
          .slice(0, 10);
        const latestDiscord = discordItems[0] ?? null;
        setLatestDiscordHistory(latestDiscord);
        setHistoryError(null);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "Failed to load latest Discord scan result.";
        setHistoryError(message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const messagesScanned = latestDiscordHistory?.messagesScanned ?? 0;
  const threatsDetected = latestDiscordHistory?.threatsDetected ?? 0;
  const suspiciousActivity = latestDiscordHistory?.suspicious ?? 0;
  const cleanRecords = latestDiscordHistory?.cleanRecords ?? 0;
  const scanCompletedSecs = latestDiscordHistory?.scanCompletedSecs ?? 0;
  const hasActiveThreat = (latestDiscordHistory?.activeThreat ?? false) || threatsDetected > 0;
  const latestTarget = latestDiscordHistory?.scrapes || "Overview";
  const channelOptions = channels.map((channel) => ({
    label: channel.title,
    value: channel.id,
  }));
  const channelPlaceholder = isLoadingChannels
    ? "Loading channels..."
    : channels.length > 0
      ? "Select server or channel"
      : "No channels available";

  function pickLatestDiscord(items: ScanHistoryOverviewItem[]): ScanHistoryOverviewItem | null {
    return (
      items
        .filter((item) => item.platform.toLowerCase() === "discord")
        .sort((a, b) => {
          const aTs = Date.parse(a.lastScanAt || "");
          const bTs = Date.parse(b.lastScanAt || "");
          return (Number.isFinite(bTs) ? bTs : 0) - (Number.isFinite(aTs) ? aTs : 0);
        })[0] ?? null
    );
  }

  async function pollLatestDiscordResult(previousLastScanAt?: string, startedAtMs?: number) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      try {
        const items = await getScanHistoryOverviewList();
        const latest = pickLatestDiscord(items);
        if (!latest) continue;
        setLatestDiscordHistory(latest);
        setHistoryError(null);
        const latestTs = Date.parse(latest.lastScanAt || "");
        const startedMatch =
          typeof startedAtMs === "number" &&
          Number.isFinite(latestTs) &&
          latestTs >= startedAtMs - 5000;
        const changedFromPrevious =
          !!previousLastScanAt && latest.lastScanAt !== previousLastScanAt;
        if (startedMatch || changedFromPrevious) {
          return;
        }
      } catch {
        // Retry on next attempt.
      }
    }
  }

  async function handleStartMonitoring() {
    if (!target || isScraping) return;

    setIsScraping(true);
    setScrapeError(null);
    const startedAtMs = Date.now();

    try {
      await scrapeDiscord(target, apexModel);
      setLastUpdatedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      const selectedChannel = channels.find((channel) => channel.id === target);
      toast.success(`Successfully scraped ${selectedChannel?.title ?? "selected channel"}.`);

      // Poll briefly because backend may write scan-history row a moment later.
      void pollLatestDiscordResult(latestDiscordHistory?.lastScanAt, startedAtMs);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to start Discord monitoring.";
      setScrapeError(message);
    } finally {
      setIsScraping(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-7">
      <Card className="relative overflow-hidden border border-[#2a3a45]/55 bg-card p-4 sm:p-5">
        <div className="relative flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#2f4250]/55 bg-[rgba(111,196,231,0.12)]">
              <MessageCircle className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-mutetext">
                Monitor servers and channels for suspicious conversations in real time
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text">
            <Search className="h-4.5 w-4.5 text-brand" />
            Server Monitoring
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.08em] text-mutetext">
              Apex Model
            </label>
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
            <label className="text-xs font-medium uppercase tracking-[0.08em] text-mutetext">
              Server or Channel
            </label>
            <Dropdown
              className="w-full"
              inputClassName="!border-[#2a3a45]/55 !focus:border-[#3f5869]/70 !ring-0"
              value={target}
              onChange={setTarget}
              options={channelOptions}
              placeholder={channelPlaceholder}
            />
            {channelsError ? <p className="text-xs text-rose-300">{channelsError}</p> : null}
          </div>

          <button
            type="button"
            onClick={handleStartMonitoring}
            disabled={!target || isScraping}
            className="w-full rounded-xl border border-[#4f6d81]/55 bg-[rgba(111,196,231,0.92)] py-2.5 text-sm font-semibold text-[#0f172a] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isScraping ? "Monitoring..." : "Start Monitoring"}
          </button>
          {scrapeError ? <p className="text-xs text-rose-300">{scrapeError}</p> : null}
        </Card>

        <Card className="space-y-4 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text">
            <Users className="h-4.5 w-4.5 text-brand" />
            Active Watchlist
          </h3>

          <div className="max-h-[268px] space-y-2 overflow-y-auto pr-1">
            {channels.length === 0 ? (
              <div className="rounded-xl border border-[#2a3a45]/45 bg-[rgba(18,22,28,0.45)] px-3 py-2 text-xs text-mutetext">
                {isLoadingChannels ? "Loading watchlist..." : "No channels in watchlist."}
              </div>
            ) : (
              channels.map((channel) => (
                <WatchRow key={channel.id} name={channel.title} tags={channel.type} />
              ))
            )}
          </div>

         
        </Card>
      </div>

      <Card className="space-y-5 border border-[#2a3a45]/55 bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <div>
              <h3 className="font-semibold text-text">Scan Results - Discord</h3>
              <p className="text-sm text-mutetext">{latestTarget} • Overview</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#2f4250]/50 bg-[rgba(111,196,231,0.1)] px-3 py-1 text-xs text-brand">
            <Clock3 size={12} />
            {latestDiscordHistory?.lastScanAgo
              ? `Last scan: ${latestDiscordHistory.lastScanAgo}`
              : lastUpdatedAt
                ? `Updated at ${lastUpdatedAt}`
                : "Waiting for first scan"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          <ResultStat value={String(messagesScanned)} label="MESSAGES SCANNED" tone="brand" />
          <ResultStat value={String(threatsDetected)} label="THREATS DETECTED" tone="danger" />
          <ResultStat value={String(suspiciousActivity)} label="SUSPICIOUS ACTIVITY" tone="warning" />
          <ResultStat value={String(cleanRecords)} label="CLEAN RECORDS" tone="success" />
        </div>

        {messagesScanned > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {scanCompletedSecs > 0 ? (
              <span className="rounded-full border border-[#2f4250]/50 bg-[rgba(111,196,231,0.1)] px-3 py-1 text-brand">
                SCAN COMPLETED IN {scanCompletedSecs.toFixed(2)}S
              </span>
            ) : null}
            {hasActiveThreat ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-rose-300">
                <AlertTriangle size={14} />
                ACTIVE THREAT DETECTED
              </span>
            ) : null}
            {!hasActiveThreat && scanCompletedSecs <= 0 ? (
              <span className="rounded-full border border-[#2f4250]/50 bg-[rgba(111,196,231,0.1)] px-3 py-1 text-brand">
                Latest scrape returned {messagesScanned} item{messagesScanned === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        ) : null}

        {historyError ? <p className="text-xs text-rose-300">{historyError}</p> : null}
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
