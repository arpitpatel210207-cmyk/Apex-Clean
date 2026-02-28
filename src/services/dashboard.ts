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
export type WeeklyOverviewPoint = {
  date: string;
  scans: number;
  clean: number;
  threats: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";

const PLATFORM_ROUTE: Record<PlatformKey, string> = {
  "4chan": "/dashboard/platform/4chan",
  telegram: "/dashboard/platform/telgram",
  discord: "/dashboard/platform/discord",
};
const WEEKLY_OVERVIEW_ROUTE = "/dashboard/weekly-overview";

const PLATFORM_ROUTE_FALLBACK: Partial<Record<PlatformKey, string[]>> = {
  telegram: ["/dashboard/platform/telegram"],
};

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message) ||
      (typeof body === "string" && body) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return body as T;
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
  fallbackDays: string[],
  fallbackVolume: number[],
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
  fallbackDays: string[],
  fallbackVolume: number[],
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

export async function getDashboardWeeklyOverview(): Promise<WeeklyOverviewPoint[]> {
  const payload = await request<unknown>(WEEKLY_OVERVIEW_ROUTE);
  return normalizeWeeklyOverview(payload);
}

export async function getDashboardMonitoring(): Promise<DashboardMonitoringResponse> {
  const fallbackDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fallback4chan = [48, 62, 77, 58, 84, 69, 92];
  const fallbackTelegram = [42, 55, 67, 73, 61, 78, 88];
  const fallbackDiscord = [35, 47, 64, 59, 71, 76, 86];

  const fetchPlatform = async (platform: PlatformKey): Promise<unknown> => {
    const candidates = [
      PLATFORM_ROUTE[platform],
      ...(PLATFORM_ROUTE_FALLBACK[platform] ?? []),
    ];

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

  const [chanRes, telegramRes, discordRes] = await Promise.allSettled([
    fetchPlatform("4chan"),
    fetchPlatform("telegram"),
    fetchPlatform("discord"),
  ]);

  return {
    "4chan": normalizePlatform(
      chanRes.status === "fulfilled" ? chanRes.value : null,
      fallbackDays,
      fallback4chan,
    ),
    telegram: normalizePlatform(
      telegramRes.status === "fulfilled" ? telegramRes.value : null,
      fallbackDays,
      fallbackTelegram,
    ),
    discord: normalizePlatform(
      discordRes.status === "fulfilled" ? discordRes.value : null,
      fallbackDays,
      fallbackDiscord,
    ),
  };
}
