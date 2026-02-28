"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card } from "@/components/ui/card";
import GradientText from "@/components/GradientText";
import { dailyStats } from "@/data/mock";

const chartColors = {
  scans: "#22d3ee",
  clean: "#22c55e",
  threats: "#ef4444",
} as const;

const seriesMeta: Record<string, { label: string; color: string }> = {
  scans: { label: "Scans", color: chartColors.scans },
  clean: { label: "Clean", color: chartColors.clean },
  threats: { label: "Threats", color: chartColors.threats },
};

type TooltipEntry = {
  dataKey?: string | number;
  value?: number | string;
};

type PremiumTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
};

function PremiumTooltip({ active, payload, label }: PremiumTooltipProps) {
  if (!active || !payload?.length) return null;
  const seen = new Set<string>();
  const uniquePayload = payload.filter((entry) => {
    const key = String(entry.dataKey);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="rounded-lg border border-[rgba(110,134,156,0.45)] bg-[rgba(7,10,15,0.96)] px-3 py-2 shadow-[0_16px_32px_rgba(0,0,0,0.52)] backdrop-blur-sm">
      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#8ea8b8]">{label}</p>
      <div className="space-y-1.5">
        {uniquePayload.map((entry: TooltipEntry) => {
          const key = String(entry.dataKey);
          const meta = seriesMeta[key];
          return (
            <div key={key} className="flex items-center justify-between gap-5 text-xs">
              <span className="inline-flex items-center gap-2 text-[#cfe5ed]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta?.color || "#aedef1" }} />
                {meta?.label || key}
              </span>
              <span className="font-semibold tabular-nums text-[#e6f5fa]">
                {Number(entry.value).toLocaleString("en-US")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TimelineChart() {
  const chartSectionRef = useRef<HTMLDivElement | null>(null);
  const lineStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introStartedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [lineAnimActive, setLineAnimActive] = useState(false);
  const [fillProgress, setFillProgress] = useState(0);
  const firstDay = dailyStats[0] ?? { scans: 0, clean: 0, threats: 0 };
  const lastDay = dailyStats[dailyStats.length - 1] ?? firstDay;

  const formatDelta = (next: number, prev: number) => {
    if (!prev) return "0.0%";
    const pct = ((next - prev) / prev) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  useEffect(() => {
    if (!chartSectionRef.current || shouldAnimate) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !introStartedRef.current) {
          introStartedRef.current = true;
          setShouldAnimate(true);
          setLineAnimActive(true);
          observer.disconnect();

          lineStopRef.current = setTimeout(() => {
            setLineAnimActive(false);
          }, 2200);
        }
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(chartSectionRef.current);
    return () => {
      observer.disconnect();
      if (lineStopRef.current) {
        clearTimeout(lineStopRef.current);
        lineStopRef.current = null;
      }
    };
  }, [shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate) return;

    let frameId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const durationMs = 1800;
    const delayMs = 2200;
    let startedAt = 0;

    const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;
      const raw = Math.min(Math.max(elapsed / durationMs, 0), 1);
      setFillProgress(easeInOut(raw));
      if (raw < 1) frameId = requestAnimationFrame(tick);
    };

    timeoutId = setTimeout(() => {
      frameId = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [shouldAnimate]);

  return (
    <div ref={chartSectionRef}>
    <Card className="animate-chart-reveal relative flex flex-col justify-start overflow-hidden border border-border bg-card p-3">
      <div className="mb-2 flex items-start justify-between">
        <GradientText
          colors={["#ef4444", "#22d3ee", "#22c55e"]}
          animationSpeed={8}
          showBorder={false}
          className="!mx-0 cursor-default text-[22px] font-semibold"
        >
          Weekly Activity
        </GradientText>
        <div className="hidden items-center gap-2 text-[11px] text-mutetext/90 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(174,222,241,0.16)] bg-[rgba(18,22,28,0.55)] px-2 py-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.scans }} />
            Scans
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(174,222,241,0.14)] bg-[rgba(18,22,28,0.48)] px-2 py-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.clean }} />
            Clean
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(174,222,241,0.12)] bg-[rgba(18,22,28,0.42)] px-2 py-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.threats }} />
            Threats
          </span>
        </div>
      </div>

      <div className="mb-2 hidden flex-wrap items-center gap-2 text-[11px] sm:flex">
        <span className="rounded-md border border-[rgba(34,211,238,0.28)] bg-[rgba(34,211,238,0.12)] px-2 py-1 font-medium text-[#7de3f2]">
          Scans {formatDelta(lastDay.scans, firstDay.scans)}
        </span>
        <span className="rounded-md border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.12)] px-2 py-1 font-medium text-[#6de29b]">
          Clean {formatDelta(lastDay.clean, firstDay.clean)}
        </span>
        <span className="rounded-md border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.12)] px-2 py-1 font-medium text-[#f88c8c]">
          Threats {formatDelta(lastDay.threats, firstDay.threats)}
        </span>
      </div>

      <div className="h-[230px] rounded-2xl border border-[rgba(120,156,188,0.22)] bg-[linear-gradient(180deg,rgba(8,13,20,0.92)_0%,rgba(6,11,18,0.78)_70%,rgba(7,12,20,0.9)_100%)] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.38)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={shouldAnimate ? "chart-animate" : "chart-static"} data={dailyStats}>
            <defs>
              <filter id="primarySoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.scans} stopOpacity={0.24} />
                <stop offset="100%" stopColor={chartColors.scans} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillClean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.clean} stopOpacity={0.15} />
                <stop offset="100%" stopColor={chartColors.clean} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillThreats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.threats} stopOpacity={0.13} />
                <stop offset="100%" stopColor={chartColors.threats} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 6" stroke="rgba(139,174,201,0.2)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#8ea4b4", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#8ea4b4", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={38}
            />

            <Tooltip
              cursor={{ stroke: "rgba(139,174,201,0.45)", strokeWidth: 1, strokeDasharray: "4 5" }}
              content={<PremiumTooltip />}
              wrapperStyle={{ visibility: shouldAnimate ? "visible" : "hidden" }}
            />

            {shouldAnimate ? (
              <>
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke={chartColors.scans}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  filter="url(#primarySoftGlow)"
                  isAnimationActive={lineAnimActive}
                  animationDuration={2200}
                  animationEasing="ease-in-out"
                  activeDot={{ r: 4, fill: chartColors.scans, stroke: "rgba(8,10,12,0.92)", strokeWidth: 2 }}
                />

                <Line
                  type="monotone"
                  dataKey="clean"
                  stroke={chartColors.clean}
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  strokeOpacity={0.86}
                  isAnimationActive={lineAnimActive}
                  animationDuration={2200}
                  animationEasing="ease-in-out"
                  activeDot={{ r: 3.6, fill: chartColors.clean, stroke: "rgba(8,10,12,0.92)", strokeWidth: 2 }}
                />

                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke={chartColors.threats}
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  strokeOpacity={0.84}
                  isAnimationActive={lineAnimActive}
                  animationDuration={2200}
                  animationEasing="ease-in-out"
                  activeDot={{ r: 3.6, fill: chartColors.threats, stroke: "rgba(8,10,12,0.92)", strokeWidth: 2 }}
                />

                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="transparent"
                  fill="url(#fillScans)"
                  fillOpacity={0.9 * fillProgress}
                  isAnimationActive={false}
                />

                <Area
                  type="monotone"
                  dataKey="clean"
                  stroke="transparent"
                  fill="url(#fillClean)"
                  fillOpacity={0.8 * fillProgress}
                  isAnimationActive={false}
                />

                <Area
                  type="monotone"
                  dataKey="threats"
                  stroke="transparent"
                  fill="url(#fillThreats)"
                  fillOpacity={0.75 * fillProgress}
                  isAnimationActive={false}
                />
              </>
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
    </div>
  );
}
