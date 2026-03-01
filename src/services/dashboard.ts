import { getApiBaseUrl, requestJson } from "@/services/http";

export type PlatformKey = "4chan" | "telegram" | "discord";

export type PlatformMonitoring = {
  scansToday: number;
  watchedCount: number;
  flaggedCount: number;
  weeklyVolume: number[];
  weeklyDays: string[];
  weeklyRisk: number[];
};

export type DashboardMonitoringResponse = Record<PlatformKey, PlatformMonitoring>;
export type DashboardSummary = {
  totalUsers: number;
  previousTotalUsers: number;
  newToday: number;
  previousNewToday: number;
  flagged: number;
  previousFlagged: number;
  activeUsers: number;
  previousActiveUsers: number;
};
export type WeeklyOverviewPoint = {
  date: string;
  scans: number;
  clean: number;
  threats: number;
};

const BASE_URL = getApiBaseUrl();

const PLATFORM_ROUTE: Record<PlatformKey, string> = {
  "4chan": "/dashboard/platform/4chan",
  telegram: "/dashboard/platform/telegram",
  discord: "/dashboard/platform/discord",
};
const DASHBOARD_SUMMARY_ROUTE = "/dashboard/summary";
const WEEKLY_OVERVIEW_ROUTE = "/dashboard/weekly-overview";

const PLATFORM_ROUTE_FALLBACK: Partial<Record<PlatformKey, string[]>> = {
  telegram: ["/dashboard/platform/telegram"],
};

let monitoringInFlight: Promise<DashboardMonitoringResponse> | null = null;

async function request<T>(path: string): Promise<T> {
  const res = await requestJson(
    `${BASE_URL}${path}`,
    {
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
    { timeoutMs: 12000, retries: 1, retryDelayMs: 400 },
  );

  if (!res.ok) {
    const message =
      (typeof res.body === "object" &&
        res.body !== null &&
        "message" in res.body &&
        typeof res.body.message === "string" &&
        res.body.message) ||
      (typeof res.body === "string" && res.body) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return res.body as T;
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asNumberArray(value: unknown, fallback: number[]): number[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value.map((item) => asNumber(item, NaN)).filter((item) => !Number.isNaN(item));
  return parsed.length ? parsed : fallback;
}

function normalizeWeeklyActivity(
  value: unknown,
  fallbackDays: string[] = [],
  fallbackVolume: number[] = [],
): { days: string[]; volume: number[] } {
  if (!Array.isArray(value)) {
    return { days: fallbackDays, volume: fallbackVolume };
  }

  const rows = value
    .map((item) => asObject(item))
    .filter((item) => Object.keys(item).length > 0);

  if (!rows.length) {
    return { days: fallbackDays, volume: fallbackVolume };
  }

  const days = rows.map((row) => String(row.day ?? "").trim()).filter(Boolean);
  const volume = rows.map((row) => asNumber(row.value, NaN)).filter((n) => !Number.isNaN(n));

  if (!days.length || !volume.length || days.length !== volume.length) {
    return { days: fallbackDays, volume: fallbackVolume };
  }

  return { days, volume };
}

function normalizePlatform(
  raw: unknown,
  fallbackDays: string[] = [],
  fallbackVolume: number[] = [],
): PlatformMonitoring {
  const root = asObject(raw);
  const data = asObject(root.data ?? root);
  const weeklyActivity = normalizeWeeklyActivity(
    data.weeklyActivity ?? data.weekly_activity,
    fallbackDays,
    fallbackVolume,
  );

  const scansToday = asNumber(
    data.scansToday ?? data.scans_today ?? data.todayScans ?? data.scanCount ?? data.scans,
    0,
  );
  const watchedCount = asNumber(
    data.watchedCount ?? data.watched_count ?? data.activeBoards ?? data.activeChannels ?? data.servers,
    0,
  );
  const flaggedCount = asNumber(
    data.flaggedCount ??
      data.flagged_count ??
      data.flaggedCountToday ??
      data.flagged_count_today ??
      data.flaggedThreads ??
      data.flaggedMessages ??
      data.flaggedPosts,
    0,
  );
  const weeklyVolume = asNumberArray(
    data.weeklyVolume ?? data.weekly_volume ?? data.volume ?? data.series ?? weeklyActivity.volume,
    weeklyActivity.volume,
  );
  const avgRisk = asNumber(data.avgRisk ?? data.avg_risk, 0);
  const weeklyRisk = asNumberArray(
    data.weeklyRisk ?? data.weekly_risk ?? data.risk ?? data.riskSeries,
    weeklyVolume.map(() => Math.max(0, Math.round(avgRisk))),
  );

  return {
    scansToday,
    watchedCount,
    flaggedCount,
    weeklyVolume,
    weeklyDays: weeklyActivity.days,
    weeklyRisk,
  };
}

function normalizeWeeklyOverview(payload: unknown): WeeklyOverviewPoint[] {
  const root = asObject(payload);
  const data = root.data ?? root;

  if (Array.isArray(data)) {
    return data.map((row) => {
      const obj = asObject(row);
      const scans = asNumber(
        obj.scans ?? obj.scanCount ?? obj.totalScans ?? obj.value,
        0,
      );
      const threats = asNumber(
        obj.threats ?? obj.threatCount ?? obj.threat_count ?? obj.flagged ?? obj.value,
        0,
      );
      return {
        date: String(obj.date ?? obj.day ?? ""),
        scans,
        clean: asNumber(
          obj.clean ?? obj.cleanCount ?? obj.clean_count ?? Math.max(scans - threats, 0),
          Math.max(scans - threats, 0),
        ),
        threats,
      };
    });
  }

  const obj = asObject(data);
  const weekly = obj.weeklyActivity ?? obj.weekly_activity;
  if (Array.isArray(weekly)) {
    return weekly.map((row) => {
      const item = asObject(row);
      const scans = asNumber(
        item.scans ?? item.scanCount ?? item.totalScans ?? item.value,
        0,
      );
      const threats = asNumber(
        item.threats ??
          item.threatCount ??
          item.threat_count ??
          item.flagged ??
          item.value,
        0,
      );
      return {
        date: String(item.day ?? item.date ?? ""),
        scans,
        clean: asNumber(
          item.clean ?? item.cleanCount ?? item.clean_count ?? Math.max(scans - threats, 0),
          Math.max(scans - threats, 0),
        ),
        threats,
      };
    });
  }

  return [];
}

function normalizeDashboardSummary(payload: unknown): DashboardSummary {
  const root = asObject(payload);
  const data = asObject(root.data ?? root);

  const totalUsers = asNumber(
    data.totalUsers ?? data.total_users ?? data.users ?? data.total,
    0,
  );
  const newToday = asNumber(
    data.newToday ?? data.new_today ?? data.todayNewUsers ?? data.newUsers,
    0,
  );
  const flagged = asNumber(
    data.flagged ?? data.flaggedUsers ?? data.flagged_users ?? data.totalFlagged,
    0,
  );
  const activeUsers = asNumber(
    data.activeUsers ?? data.active_users ?? data.onlineUsers ?? data.active,
    0,
  );

  return {
    totalUsers,
    previousTotalUsers: asNumber(
      data.previousTotalUsers ??
        data.previous_total_users ??
        data.prevTotalUsers ??
        data.totalUsersPrevious,
      totalUsers,
    ),
    newToday,
    previousNewToday: asNumber(
      data.previousNewToday ??
        data.previous_new_today ??
        data.prevNewToday ??
        data.newTodayPrevious,
      newToday,
    ),
    flagged,
    previousFlagged: asNumber(
      data.previousFlagged ??
        data.previous_flagged ??
        data.prevFlagged ??
        data.flaggedPrevious,
      flagged,
    ),
    activeUsers,
    previousActiveUsers: asNumber(
      data.previousActiveUsers ??
        data.previous_active_users ??
        data.prevActiveUsers ??
        data.activeUsersPrevious,
      activeUsers,
    ),
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const payload = await request<unknown>(DASHBOARD_SUMMARY_ROUTE);
  return normalizeDashboardSummary(payload);
}

export async function getDashboardWeeklyOverview(): Promise<WeeklyOverviewPoint[]> {
  const payload = await request<unknown>(WEEKLY_OVERVIEW_ROUTE);
  return normalizeWeeklyOverview(payload);
}

export async function getDashboardMonitoring(): Promise<DashboardMonitoringResponse> {
  if (monitoringInFlight) {
    return monitoringInFlight;
  }

  const fetchPlatform = async (platform: PlatformKey): Promise<unknown> => {
    const candidates = Array.from(
      new Set([PLATFORM_ROUTE[platform], ...(PLATFORM_ROUTE_FALLBACK[platform] ?? [])]),
    );

    let lastError: unknown = null;
    for (const path of candidates) {
      try {
        return await request<unknown>(path);
      } catch (error: unknown) {
        lastError = error;
      }
    }
    throw lastError ?? new Error(`Failed to load ${platform} platform data.`);
  };

  monitoringInFlight = (async () => {
    const [chanRes, telegramRes, discordRes] = await Promise.allSettled([
      fetchPlatform("4chan"),
      fetchPlatform("telegram"),
      fetchPlatform("discord"),
    ]);

    return {
      "4chan": normalizePlatform(
        chanRes.status === "fulfilled" ? chanRes.value : null,
      ),
      telegram: normalizePlatform(
        telegramRes.status === "fulfilled" ? telegramRes.value : null,
      ),
      discord: normalizePlatform(
        discordRes.status === "fulfilled" ? discordRes.value : null,
      ),
    };
  })();

  try {
    return await monitoringInFlight;
  } finally {
    monitoringInFlight = null;
  }
}
