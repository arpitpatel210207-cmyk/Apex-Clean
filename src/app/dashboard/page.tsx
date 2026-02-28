"use client";

import { Card } from "@/components/ui/card";
import { CreateModal } from "@/components/ui/create-modal";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { Globe, Send, MessageCircle } from "lucide-react";
import { TimelineChart } from "@/components/dashboard/timeline";
import { useEffect, useState } from "react";

type Trend = "up" | "down" | "alert";
type PlatformKey = "4can" | "telegram" | "discord";

const statCards: {
  title: string;
  current: number;
  previous: number;
  unit?: string;
  alertOnIncrease?: boolean;
  alertLabel?: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Total Users",
    current: 12500,
    previous: 12200,
    icon: Users,
  },
  {
    title: "New Today",
    current: 56,
    previous: 50,
    icon: UserPlus,
  },
  {
    title: "Flagged",
    current: 32,
    previous: 27,
    alertOnIncrease: true,
    alertLabel: "Action Required",
    icon: ShieldAlert,
  },
  {
    title: "Active Users",
    current: 8420,
    previous: 8523,
    icon: Clock,
  },
];

function getTrend(
  current: number,
  previous: number,
  options?: { alertOnIncrease?: boolean; alertLabel?: string },
) {
  const delta = current - previous;
  const percent = previous === 0 ? 0 : (Math.abs(delta) / previous) * 100;

  if (options?.alertOnIncrease && delta > 0) {
    return {
      status: "alert" as Trend,
      trendText: options.alertLabel ?? "Action Required",
    };
  }

  if (delta > 0) {
    return { status: "up" as Trend, trendText: `+${percent.toFixed(1)}% increase` };
  }

  if (delta < 0) {
    return { status: "down" as Trend, trendText: `-${percent.toFixed(1)}% dip` };
  }

  return { status: "up" as Trend, trendText: "No change" };
}

export default function DashboardPage() {
  const [activePlatform, setActivePlatform] = useState<PlatformKey | null>(null);
  const platformSeries: Record<PlatformKey, number[]> = {
    "4can": [48, 62, 77, 58, 84, 69, 92],
    telegram: [42, 55, 67, 73, 61, 78, 88],
    discord: [35, 47, 64, 59, 71, 76, 86],
  };

  const modalContent: Record<
    PlatformKey,
    {
      title: string;
      graph: {
        days: string[];
        volume: number[];
        risk: number[];
      };
      rows: { label: string; value: string }[];
    }
  > = {
    "4can": {
      title: "4can Monitoring",
      graph: {
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        volume: [48, 62, 77, 58, 84, 69, 92],
        risk: [22, 26, 31, 24, 35, 29, 38],
      },
      rows: [
        { label: "Active Boards", value: "12 tracked" },
        { label: "Scans Today", value: "2,340" },
        { label: "Flagged Threads", value: "41" },
      ],
    },
    telegram: {
      title: "Telegram Tracking",
      graph: {
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        volume: [42, 55, 67, 73, 61, 78, 88],
        risk: [18, 21, 27, 32, 28, 34, 36],
      },
      rows: [
        { label: "Channels Watched", value: "58 channels" },
        { label: "Scans Today", value: "1,780" },
        { label: "Flagged Messages", value: "29" },
      ],
    },
    discord: {
      title: "Discord Surveillance",
      graph: {
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        volume: [35, 47, 64, 59, 71, 76, 86],
        risk: [14, 17, 22, 24, 26, 29, 31],
      },
      rows: [
        { label: "Servers Monitored", value: "24 servers" },
        { label: "Scans Today", value: "1,120" },
        { label: "Flagged Posts", value: "17" },
      ],
    },
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">

      <h1 className="page-heading text-text">
        Dashboard
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        {statCards.map((card, index) => (
          (() => {
            const computed = getTrend(card.current, card.previous, {
              alertOnIncrease: card.alertOnIncrease,
              alertLabel: card.alertLabel,
            });

            return (
          <Stat
            key={card.title}
            title={card.title}
            value={card.current}
            icon={card.icon}
            trend={computed.trendText}
            status={computed.status}
            unit={card.unit}
            revealDelayMs={80 + index * 80}
          />
            );
          })()
        ))}
      </div>


      {/* PLATFORMS */}
    <div className="grid grid-cols-1 gap-4 py-2 sm:py-4 md:grid-cols-2 xl:grid-cols-3">

  <PlatformCard
    title="4can Monitoring"
    activity="2,340 scans today"
    icon={Globe}
    series={platformSeries["4can"]}
    platform="4can"
    revealDelayMs={120}
    onClick={() => setActivePlatform("4can")}
  />

  <PlatformCard
    title="Telegram Tracking"
    activity="1,780 scans today"
    icon={Send}
    series={platformSeries.telegram}
    platform="telegram"
    revealDelayMs={200}
    onClick={() => setActivePlatform("telegram")}
  />

  <PlatformCard
    title="Discord Surveillance"
    activity="1,120 scans today"
    icon={MessageCircle}
    series={platformSeries.discord}
    platform="discord"
    revealDelayMs={280}
    onClick={() => setActivePlatform("discord")}
  />

</div>


      {/* AI ENGINE */}
      {/* <Card className="space-y-4">
        <h3 className="text-xl font-semibold text-brand">
          AI Detection Engine
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {aiMetrics.map(m => (
            <Metric key={m.label} {...m} />
          ))}
        </div>
      </Card> */}

      {/* GEO */}
     <TimelineChart />

      <CreateModal
        open={activePlatform !== null}
        onClose={() => setActivePlatform(null)}
        title={activePlatform ? modalContent[activePlatform].title : "Platform"}
      >
        {activePlatform ? (
          <div className="space-y-3">
            <WeeklyDetailGraph
              platform={activePlatform}
              days={modalContent[activePlatform].graph.days}
              volume={modalContent[activePlatform].graph.volume}
              risk={modalContent[activePlatform].graph.risk}
            />

            {modalContent[activePlatform].rows.map((row) => (
              <div
                key={row.label}
                className="modal-surface flex items-center justify-between rounded-xl px-4 py-3"
              >
                <span className="text-sm">{row.label}</span>
                <span className="modal-value text-sm font-semibold">{row.value}</span>
              </div>
            ))}

          </div>
        ) : null}
      </CreateModal>


      {/* SLOGAN */}
      {/* <Card className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-brand">
          Advanced Drug Detection
        </h2>
        <p className="text-mutetext">
          AI-powered monitoring across social platforms to protect communities.
        </p>
      </Card> */}

    </div>
  );
}

/* COMPONENTS */

function Stat({
  title,
  value,
  trend,
  status,
  unit,
  revealDelayMs = 0,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  trend: string;
  status: Trend;
  unit?: string;
  revealDelayMs?: number;
  icon: LucideIcon;
}) {
  const tones: Record<Trend, { text: string; accent: string; pill: string }> = {
    up: {
      text: "text-emerald-300",
      accent: "bg-emerald-300",
      pill: "bg-emerald-400/15 text-emerald-200 border border-emerald-300/35",
    },
    down: {
      text: "text-rose-300",
      accent: "bg-rose-300",
      pill: "bg-rose-400/15 text-rose-200 border border-rose-300/35",
    },
    alert: {
      text: "text-amber-300",
      accent: "bg-amber-300",
      pill: "bg-amber-400/15 text-amber-200 border border-amber-300/35",
    },
  };

  const trendIcon: Record<Trend, LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    alert: AlertTriangle,
  };

  const TrendIcon = trendIcon[status];
  const [countValue, setCountValue] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;

    let frame = 0;
    let startAt = 0;
    const durationMs = 1200;
    const timer = window.setTimeout(() => {
      const step = (now: number) => {
        if (!startAt) startAt = now;
        const progress = Math.min((now - startAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCountValue(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, revealDelayMs);

    return () => {
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, revealDelayMs]);

  const shownValue =
    typeof value === "number" ? countValue.toLocaleString("en-US") : value;

  return (
    <Card className="animate-chart-reveal relative overflow-hidden rounded-2xl bg-card px-5 py-5 shadow-soft" style={{ animationDelay: `${revealDelayMs}ms` }}>
      <span className={`absolute inset-y-0 left-0 w-[3px] ${tones[status].accent}`} />
      {/* <span className={`absolute inset-y-2 right-0 w-[2px] rounded-l ${tones[status].accent} opacity-80`} /> */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-mutetext">
          {title}
        </p>
        <Icon className={`h-4 w-4 opacity-90 ${tones[status].text}`} />
      </div>

      <div className="text-[30px] font-bold leading-none tabular-nums text-text">
        {shownValue}
        {unit ? <span className="ml-1 text-[14px] tabular-nums">{unit}</span> : null}
      </div>

      <div
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${tones[status].pill}`}
      >
        <TrendIcon className="h-3.5 w-3.5" />
        <span>{trend}</span>
      </div>
    </Card>
  );
}




function PlatformCard({
  title,
  activity,
  series,
  platform,
  revealDelayMs = 120,
  icon: Icon,
  onClick,
}: {
  title: string;
  activity: string;
  series: number[];
  platform: PlatformKey;
  revealDelayMs?: number;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      className="group animate-chart-reveal relative min-h-[280px] min-w-0 flex-1 cursor-pointer rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.2)]"
      style={{ animationDelay: `${revealDelayMs}ms` }}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[1px] transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(174,222,241,0.22),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-14px_24px_rgba(2,6,23,0.2)]" />
      <div className="relative z-10 flex h-full flex-col space-y-4">

      {/* HEADER */}
      <div className="flex items-center gap-3 text-text">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-card2/70">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <h3 className="text-[15px] font-semibold tracking-[0.01em]">{title}</h3>
      </div>

      <div className="pt-1">
        <PillBarsChart data={series} platform={platform} />
      </div>


      {/* FOOTER STAT */}
      <div className="mt-auto text-[14px] font-medium text-brand">
        {activity}
      </div>
      </div>

    </Card>
  );
}

function PillBarsChart({ data, platform }: { data: number[]; platform: PlatformKey }) {
  const bars = data.slice(0, 7);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const min = Math.min(...bars);
  const max = Math.max(...bars);
  const range = Math.max(max - min, 1);
  const heights = bars.map((v) => 30 + ((v - min) / range) * 70);

  const palette: Record<PlatformKey, string[]> = {
    "4can": [
      "rgba(255,69,0,0.26)",
      "rgba(255,69,0,0.34)",
      "rgba(255,69,0,0.42)",
      "rgba(255,69,0,0.50)",
      "rgba(255,69,0,0.58)",
      "rgba(255,69,0,0.68)",
      "rgba(255,69,0,0.78)",
    ],
    discord: [
      "rgba(88,101,242,0.26)",
      "rgba(88,101,242,0.34)",
      "rgba(88,101,242,0.42)",
      "rgba(88,101,242,0.50)",
      "rgba(88,101,242,0.58)",
      "rgba(88,101,242,0.68)",
      "rgba(88,101,242,0.78)",
    ],
    telegram: [
      "rgba(34,158,217,0.26)",
      "rgba(34,158,217,0.34)",
      "rgba(34,158,217,0.42)",
      "rgba(34,158,217,0.50)",
      "rgba(34,158,217,0.58)",
      "rgba(34,158,217,0.68)",
      "rgba(34,158,217,0.78)",
    ],
  };

  return (
    <div className="rounded-xl border border-[rgba(0,0,0,0.78)] bg-[rgb(12,12,12)] px-3 py-3 shadow-[inset_6px_6px_14px_rgba(0,0,0,0.86),inset_-2px_-2px_6px_rgba(255,255,255,0.08),0_1px_0_rgba(0,0,0,0.62)]">
      <div className="flex h-32 items-end gap-1.5 rounded-lg px-0.5">
        {heights.map((h, i) => (
          <div
            key={`${platform}-${i}`}
            className="animate-bar-rise w-full rounded-full"
            style={{
              height: `${h}%`,
              backgroundColor: palette[platform][i],
              animationDelay: `${i * 180}ms`,
              boxShadow: i === 0 ? "none" : `0 0 0 1px ${palette[platform][i].replace("0.62", "0.34").replace("0.38", "0.24").replace("0.76", "0.42").replace("0.52", "0.3")}`,
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center gap-2 px-1">
        {days.map((day, i) => (
          <span key={`${platform}-day-${i}`} className="w-full text-center text-[10px] text-mutetext">
            {day}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[12px] font-medium tracking-[0.04em] text-brand">
        Activity trend
      </p>
    </div>
  );
}

function WeeklyDetailGraph({
  platform,
  days,
  volume,
  risk,
}: {
  platform: PlatformKey;
  days: string[];
  volume: number[];
  risk: number[];
}) {
  const totalWeekly = volume.reduce((sum, item) => sum + item, 0);
  const avgRisk = Math.round(risk.reduce((sum, item) => sum + item, 0) / risk.length);

  let peakDay = days[0];
  let peakValue = volume[0];
  for (let i = 1; i < volume.length; i++) {
    if (volume[i] > peakValue) {
      peakValue = volume[i];
      peakDay = days[i];
    }
  }

  return (
    <div className="modal-surface rounded-xl p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="modal-value text-[12px] font-medium uppercase tracking-[0.04em]">Weekly Activity</p>
        <span className="modal-subtle text-[11px]">Last 7 days</span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="modal-surface rounded-lg px-2.5 py-2">
          <p className="modal-subtle text-[11px] font-medium uppercase tracking-[0.04em]">Weekly Total</p>
          <p className="mt-1 text-[14px] font-semibold tabular-nums">{totalWeekly}</p>
        </div>
        <div className="modal-surface rounded-lg px-2.5 py-2">
          <p className="modal-subtle text-[11px] font-medium uppercase tracking-[0.04em]">Peak Day</p>
          <p className="mt-1 text-[14px] font-semibold">{peakDay}</p>
        </div>
        <div className="modal-surface rounded-lg px-2.5 py-2">
          <p className="modal-subtle text-[11px] font-medium uppercase tracking-[0.04em]">Avg Risk</p>
          <p className="mt-1 text-[14px] font-semibold tabular-nums">{avgRisk}%</p>
        </div>
      </div>

      <PillBarsChart data={volume} platform={platform} />

      <div className="modal-subtle mt-2 flex items-center gap-4 text-[12px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-brand" />
          Activity Trend
        </div>
      </div>
    </div>
  );
}
