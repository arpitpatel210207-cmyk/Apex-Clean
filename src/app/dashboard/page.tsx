"use client";

import { Card } from "@/components/ui/card";
import { CreateModal } from "@/components/ui/create-modal";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { Globe, Send, MessageCircle } from "lucide-react";
import { TimelineChart } from "@/components/dashboard/timeline";
import { useEffect, useRef, useState } from "react";
import {
  getDashboardMonitoring,
  getDashboardSummary,
  type DashboardMonitoringResponse,
  type DashboardSummary,
} from "@/services/dashboard";

type Trend = "up" | "down" | "alert";
type PlatformKey = "4chan" | "telegram" | "discord";
const MONITORING_CACHE_KEY = "dashboard_monitoring_cache_v1";
const SUMMARY_CACHE_KEY = "dashboard_summary_cache_v1";

function getTrend(
  current: number,
  previous: number,
  options?: { alertOnIncrease?: boolean; alertLabel?: string },
) {
  const delta = current - previous;

  if (options?.alertOnIncrease && delta > 0) {
    return "alert" as Trend;
  }

  if (delta > 0) {
    return "up" as Trend;
  }

  if (delta < 0) {
    return "down" as Trend;
  }

  return "up" as Trend;
}

export default function DashboardPage() {
  const [activePlatform, setActivePlatform] = useState<PlatformKey | null>(null);
  const [monitoring, setMonitoring] = useState<DashboardMonitoringResponse | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(MONITORING_CACHE_KEY);
      if (cached) {
        setMonitoring(JSON.parse(cached) as DashboardMonitoringResponse);
      }
    } catch {}

    let mounted = true;
    getDashboardMonitoring()
      .then((data) => {
        if (!mounted) return;
        setMonitoring(data);
        try {
          window.localStorage.setItem(MONITORING_CACHE_KEY, JSON.stringify(data));
        } catch {}
      })
      .catch(() => {
        if (!mounted) return;
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(SUMMARY_CACHE_KEY);
      if (cached) {
        setSummary(JSON.parse(cached) as DashboardSummary);
      }
    } catch {}

    let mounted = true;
    getDashboardSummary()
      .then((data) => {
        if (!mounted) return;
        setSummary(data);
        try {
          window.localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(data));
        } catch {}
      })
      .catch(() => {
        if (!mounted) return;
      });
    return () => {
      mounted = false;
    };
  }, []);

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
      current: summary?.totalUsers ?? 0,
      previous: summary?.previousTotalUsers ?? summary?.totalUsers ?? 0,
      icon: Users,
    },
    {
      title: "New Today",
      current: summary?.newToday ?? 0,
      previous: summary?.previousNewToday ?? summary?.newToday ?? 0,
      icon: UserPlus,
    },
    {
      title: "Flagged",
      current: summary?.flagged ?? 0,
      previous: summary?.previousFlagged ?? summary?.flagged ?? 0,
      alertOnIncrease: true,
      alertLabel: "Action Required",
      icon: ShieldAlert,
    },
    {
      title: "Active Users",
      current: summary?.activeUsers ?? 0,
      previous: summary?.previousActiveUsers ?? summary?.activeUsers ?? 0,
      icon: Clock,
    },
  ];

  const platformSeries: Record<PlatformKey, number[]> = {
    "4chan": monitoring?.["4chan"]?.weeklyVolume ?? [],
    telegram: monitoring?.telegram?.weeklyVolume ?? [],
    discord: monitoring?.discord?.weeklyVolume ?? [],
  };
  const platformDays: Record<PlatformKey, string[]> = {
    "4chan": monitoring?.["4chan"]?.weeklyDays ?? [],
    telegram: monitoring?.telegram?.weeklyDays ?? [],
    discord: monitoring?.discord?.weeklyDays ?? [],
  };

  const modalContent: Record<
    PlatformKey,
    {
      title: string;
      rows: { label: string }[];
    }
  > = {
    "4chan": {
      title: "4chan Monitoring",
      rows: [
        { label: "Active Boards" },
        { label: "Scans Today" },
        { label: "Flagged Threads" },
      ],
    },
    telegram: {
      title: "Telegram Tracking",
      rows: [
        { label: "Channels Watched" },
        { label: "Scans Today" },
        { label: "Flagged Messages" },
      ],
    },
    discord: {
      title: "Discord Surveillance",
      rows: [
        { label: "Servers Monitored" },
        { label: "Scans Today" },
        { label: "Flagged Posts" },
      ],
    },
  };

  const resolvedModalContent: Record<
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
    "4chan": {
      ...modalContent["4chan"],
      graph: {
        days: platformDays["4chan"],
        volume: platformSeries["4chan"],
        risk: monitoring?.["4chan"]?.weeklyRisk ?? [],
      },
      rows: [
        {
          label: "Active Boards",
          value: `${(monitoring?.["4chan"]?.watchedCount ?? 0).toLocaleString("en-US")} tracked`,
        },
        {
          label: "Scans Today",
          value: (monitoring?.["4chan"]?.scansToday ?? 0).toLocaleString("en-US"),
        },
        {
          label: "Flagged Threads",
          value: (monitoring?.["4chan"]?.flaggedCount ?? 0).toLocaleString("en-US"),
        },
      ],
    },
    telegram: {
      ...modalContent.telegram,
      graph: {
        days: platformDays.telegram,
        volume: platformSeries.telegram,
        risk: monitoring?.telegram?.weeklyRisk ?? [],
      },
      rows: [
        {
          label: "Channels Watched",
          value: `${(monitoring?.telegram?.watchedCount ?? 0).toLocaleString("en-US")} channels`,
        },
        {
          label: "Scans Today",
          value: (monitoring?.telegram?.scansToday ?? 0).toLocaleString("en-US"),
        },
        {
          label: "Flagged Messages",
          value: (monitoring?.telegram?.flaggedCount ?? 0).toLocaleString("en-US"),
        },
      ],
    },
    discord: {
      ...modalContent.discord,
      graph: {
        days: platformDays.discord,
        volume: platformSeries.discord,
        risk: monitoring?.discord?.weeklyRisk ?? [],
      },
      rows: [
        {
          label: "Servers Monitored",
          value: `${(monitoring?.discord?.watchedCount ?? 0).toLocaleString("en-US")} servers`,
        },
        {
          label: "Scans Today",
          value: (monitoring?.discord?.scansToday ?? 0).toLocaleString("en-US"),
        },
        {
          label: "Flagged Posts",
          value: (monitoring?.discord?.flaggedCount ?? 0).toLocaleString("en-US"),
        },
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
            status={computed}
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
    title="4chan Monitoring"
    activity={`${(monitoring?.["4chan"]?.scansToday ?? 0).toLocaleString("en-US")} scans today`}
    icon={Globe}
    series={platformSeries["4chan"]}
    platform="4chan"
    days={platformDays["4chan"]}
    revealDelayMs={120}
    onClick={() => setActivePlatform("4chan")}
  />

  <PlatformCard
    title="Telegram Tracking"
    activity={`${(monitoring?.telegram?.scansToday ?? 0).toLocaleString("en-US")} scans today`}
    icon={Send}
    series={platformSeries.telegram}
    platform="telegram"
    days={platformDays.telegram}
    revealDelayMs={200}
    onClick={() => setActivePlatform("telegram")}
  />

  <PlatformCard
    title="Discord Surveillance"
    activity={`${(monitoring?.discord?.scansToday ?? 0).toLocaleString("en-US")} scans today`}
    icon={MessageCircle}
    series={platformSeries.discord}
    platform="discord"
    days={platformDays.discord}
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
              days={resolvedModalContent[activePlatform].graph.days}
              volume={resolvedModalContent[activePlatform].graph.volume}
              risk={resolvedModalContent[activePlatform].graph.risk}
            />

            {resolvedModalContent[activePlatform].rows.map((row) => (
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
  status,
  unit,
  revealDelayMs = 0,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  status: Trend;
  unit?: string;
  revealDelayMs?: number;
  icon: LucideIcon;
}) {
  const tones: Record<Trend, { text: string; accent: string }> = {
    up: {
      text: "text-emerald-300",
      accent: "bg-emerald-300",
    },
    down: {
      text: "text-rose-300",
      accent: "bg-rose-300",
    },
    alert: {
      text: "text-amber-300",
      accent: "bg-amber-300",
    },
  };
  const [countValue, setCountValue] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => {
      const mobile = mobileMedia.matches;
      setIsMobileViewport(mobile);
      if (!mobile) setIsInView(true);
    };

    updateViewport();
    mobileMedia.addEventListener("change", updateViewport);
    return () => mobileMedia.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (isMobileViewport !== true || !cardRef.current || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobileViewport, isInView]);

  const animate = isMobileViewport === null ? false : !isMobileViewport || isInView;
  const isHiddenBeforeReveal = isMobileViewport === true && !isInView;

  useEffect(() => {
    if (typeof value !== "number" || !animate) return;

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
  }, [value, revealDelayMs, animate]);

  const shownValue =
    typeof value === "number"
      ? (animate ? countValue : value).toLocaleString("en-US")
      : value;

  return (
    <div ref={cardRef} className={isHiddenBeforeReveal ? "opacity-0" : "opacity-100"}>
      <Card
        className={`${animate ? "animate-chart-reveal" : ""} relative overflow-hidden rounded-2xl bg-card px-5 py-5 shadow-soft`}
        style={animate ? { animationDelay: `${revealDelayMs}ms` } : undefined}
      >
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
      </Card>
    </div>
  );
}




function PlatformCard({
  title,
  activity,
  series,
  days,
  platform,
  revealDelayMs = 120,
  icon: Icon,
  onClick,
}: {
  title: string;
  activity: string;
  series: number[];
  days: string[];
  platform: PlatformKey;
  revealDelayMs?: number;
  icon: LucideIcon;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => {
      const mobile = mobileMedia.matches;
      setIsMobileViewport(mobile);
      if (!mobile) setIsInView(true);
    };

    updateViewport();
    mobileMedia.addEventListener("change", updateViewport);
    return () => mobileMedia.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (isMobileViewport !== true || !cardRef.current || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobileViewport, isInView]);

  const animate = isMobileViewport === null ? false : !isMobileViewport || isInView;
  const isHiddenBeforeReveal = isMobileViewport === true && !isInView;

  return (
    <div ref={cardRef} className={isHiddenBeforeReveal ? "opacity-0" : "opacity-100"}>
      <Card
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onClick();
        }}
        className={`group ${animate ? "animate-chart-reveal" : ""} relative min-h-[280px] min-w-0 flex-1 cursor-pointer rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.2)]`}
        style={animate ? { animationDelay: `${revealDelayMs}ms` } : undefined}
      >
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[1px] transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(174,222,241,0.22),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-14px_24px_rgba(2,6,23,0.2)]" />
        <div className="relative z-10 flex h-full flex-col space-y-4">

        {/* HEADER */}
        <div className="flex items-center gap-3 text-text">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-card2/70">
            <Icon className="h-5 w-5 text-brand" />
          </div>
          <h3 className="text-[18px] font-semibold tracking-[0.01em]">{title}</h3>
        </div>

        <div className="pt-1">
          <PillBarsChart data={series} days={days} platform={platform} animate={animate} />
        </div>


        {/* FOOTER STAT */}
        <div className="mt-auto text-[14px] font-medium text-brand">
          {activity}
        </div>
        </div>

      </Card>
    </div>
  );
}

function PillBarsChart({
  data,
  days,
  platform,
  animate = true,
}: {
  data: number[];
  days?: string[];
  platform: PlatformKey;
  animate?: boolean;
}) {
  const bars = data.slice(0, 7);
  const dayLabels = (days ?? [])
    .slice(0, bars.length)
    .map((day) => day.slice(0, 1));
  if (!bars.length) {
    return (
      <div className="rounded-xl border border-[rgba(0,0,0,0.78)] bg-[rgb(12,12,12)] px-3 py-3 shadow-[inset_6px_6px_14px_rgba(0,0,0,0.86),inset_-2px_-2px_6px_rgba(255,255,255,0.08),0_1px_0_rgba(0,0,0,0.62)]">
        <div className="grid h-32 place-items-center text-[12px] text-mutetext">No data</div>
      </div>
    );
  }
  const min = Math.min(...bars);
  const max = Math.max(...bars);
  const range = Math.max(max - min, 1);
  const heights = bars.map((v) => 30 + ((v - min) / range) * 70);

  const palette: Record<PlatformKey, string[]> = {
    "4chan": [
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
            className={`${animate ? "animate-bar-rise" : ""} w-full rounded-full`}
            style={{
              height: `${h}%`,
              backgroundColor: palette[platform][i],
              animationDelay: animate ? `${i * 180}ms` : undefined,
              boxShadow: i === 0 ? "none" : `0 0 0 1px ${palette[platform][i].replace("0.62", "0.34").replace("0.38", "0.24").replace("0.76", "0.42").replace("0.52", "0.3")}`,
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center gap-2 px-1">
        {dayLabels.map((day, i) => (
          <span key={`${platform}-day-${i}`} className="w-full text-center text-[10px] text-mutetext">
            {day}
          </span>
        ))}
      </div>
      {/* <p className="mt-1 text-[12px] font-medium tracking-[0.04em] text-brand">
        Activity trend
      </p> */}
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
  const avgRisk = risk.length
    ? Math.round(risk.reduce((sum, item) => sum + item, 0) / risk.length)
    : 0;

  let peakDay = "N/A";
  let peakValue = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < volume.length; i++) {
    if (volume[i] > peakValue) {
      peakValue = volume[i];
      peakDay = days[i] ?? `Day ${i + 1}`;
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

      <PillBarsChart data={volume} days={days} platform={platform} />

      <div className="modal-subtle mt-2 flex items-center gap-4 text-[12px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-brand" />
          Activity Trend
        </div>
      </div>
    </div>
  );
}
