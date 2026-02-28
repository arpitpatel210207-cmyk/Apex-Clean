export type ScanHistorySummary = {
  totalScans: number;
  threatsFound: number;
  analyzed: number;
  successRate: number;
};
export type ScanHistoryOverviewItem = {
  scanId: string;
  platform: string;
  user: string;
  scrapes: string;
  messagesScanned: number;
  threatsDetected: number;
  suspicious: number;
  cleanRecords: number;
  scanCompletedSecs: number;
  activeThreat: boolean;
  lastScanAt: string;
  lastScanAgo: string;
};
export type ScanHistoryExportType = "pdf" | "csv" | "json";

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";
const SUMMARY_ROUTE = "/scan-history/summary";
const OVERVIEW_ROUTE = "/scan-history/overview";
const EXPORT_ROUTE = "/scan-history/export";

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ""): string {
  const s = String(value ?? "").trim();
  return s || fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return fallback;
}

export async function getScanHistorySummary(): Promise<ScanHistorySummary> {
  const res = await fetch(`${BASE_URL}${SUMMARY_ROUTE}`, {
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

  const obj = asObject(body);
  const data = asObject(obj.data ?? obj);

  return {
    totalScans: asNumber(data.totalScans ?? data.total_scans, 0),
    threatsFound: asNumber(data.threatsFound ?? data.threats_found, 0),
    analyzed: asNumber(data.analyzed, 0),
    successRate: asNumber(data.successRate ?? data.success_rate, 0),
  };
}

export async function getScanHistoryOverviewList(): Promise<ScanHistoryOverviewItem[]> {
  const res = await fetch(`${BASE_URL}${OVERVIEW_ROUTE}`, {
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

  const root = asObject(body);
  const data = asObject(root.data ?? root);
  const listContainer = asObject(data.list ?? root.list ?? {});
  const listRaw =
    data.items ??
    data.results ??
    root.items ??
    root.results ??
    listContainer.items ??
    listContainer.list;
  const list = Array.isArray(listRaw) ? listRaw : [];

  return list.map((row, index) => {
    const item = asObject(row);
    return {
      scanId: asString(item.scanId ?? item.scan_id, `scan-${index + 1}`),
      platform: asString(item.platform, "unknown"),
      user: asString(item.user, "unknown"),
      scrapes: asString(item.scrapes ?? item.target, "unknown"),
      messagesScanned: asNumber(item.messagesScanned ?? item.messages_scanned, 0),
      threatsDetected: asNumber(item.threatsDetected ?? item.threats_detected, 0),
      suspicious: asNumber(item.suspicious, 0),
      cleanRecords: asNumber(item.cleanRecords ?? item.clean_records, 0),
      scanCompletedSecs: asNumber(item.scanCompletedSecs ?? item.scan_completed_secs, 0),
      activeThreat: asBoolean(item.activeThreat ?? item.active_threat, false),
      lastScanAt: asString(item.lastScanAt ?? item.last_scan_at, ""),
      lastScanAgo: asString(item.lastScanAgo ?? item.last_scan_ago, "just now"),
    };
  });
}

export async function exportScanHistory(type: ScanHistoryExportType): Promise<{
  blob: Blob;
  filename: string;
}> {
  const acceptByType: Record<ScanHistoryExportType, string> = {
    pdf: "application/pdf",
    csv: "text/csv",
    json: "application/json",
  };

  const res = await fetch(
    `${BASE_URL}${EXPORT_ROUTE}?format=${encodeURIComponent(type)}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: acceptByType[type],
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to export ${type.toUpperCase()}`);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") ?? "";
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  const fallbackName = `scan-history.${type}`;

  return {
    blob,
    filename: filenameMatch?.[1] ?? fallbackName,
  };
}
