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
export type ModerationPrediction = {
  id: string;
  message: string;
  userName: string;
  userId: string;
  risk: "Critical" | "High" | "Low";
};

export type FlagUserPayload = {
  predictionId: string;
  scanId: string;
  userId: string;
  actorName?: string;
  message?: string;
};

function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "/api";

  // Guard against common broken env values like "http://loc".
  if (value === "http://loc" || value === "https://loc") return "/api";

  if (value.startsWith("/")) {
    return value.replace(/\/+$/, "") || "/api";
  }

  try {
    const url = new URL(value);
    if (url.hostname === "loc") return "/api";
    return value.replace(/\/+$/, "");
  } catch {
    return "/api";
  }
}

const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_ADMIN_API_URL);
const SUMMARY_ROUTE = "/scan-history/summary";
const OVERVIEW_ROUTE = "/scan-history/overview";
const EXPORT_ROUTE = "/scan-history/export";
const MODERATION_PREDICTIONS_ROUTE = "/moderation/predictions";
const MODERATION_FLAG_USER_ROUTE = "/moderation/flag-user";
const MODERATION_CANCEL_FLAG_ROUTE = "/moderation/cancel-flag";

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
    credentials: "include",
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
  const separator = OVERVIEW_ROUTE.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${OVERVIEW_ROUTE}${separator}_ts=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
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
    const parsedScanId = asString(
      item.scanId ??
        item.scan_id ??
        item.scanID ??
        item.scan ??
        item.id ??
        item._id,
      `scan-${index + 1}`,
    );
    return {
      scanId: parsedScanId,
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
      credentials: "include",
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

function normalizeRisk(raw: unknown): "Critical" | "High" | "Low" {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "critical" || value === "severe") return "Critical";
  if (value === "high" || value === "medium") return "High";
  return "Low";
}

function findFirstArrayCandidate(value: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (depth > 4) return null;

  const obj = asObject(value);
  if (!Object.keys(obj).length) return null;

  const preferredKeys = [
    "items",
    "results",
    "predictions",
    "list",
    "data",
    "rows",
    "messages",
    "records",
  ];

  for (const key of preferredKeys) {
    if (key in obj) {
      const found = findFirstArrayCandidate(obj[key], depth + 1);
      if (found) return found;
    }
  }

  for (const nested of Object.values(obj)) {
    const found = findFirstArrayCandidate(nested, depth + 1);
    if (found) return found;
  }

  return null;
}

function parseModerationPredictions(payload: unknown): ModerationPrediction[] {
  const root = asObject(payload);
  const dataRaw = root.data ?? root;
  const data = asObject(dataRaw);
  const listRaw =
    (Array.isArray(dataRaw) ? dataRaw : null) ??
    data.items ??
    data.results ??
    data.predictions ??
    data.list ??
    data.data ??
    root.items ??
    root.results ??
    root.predictions;

  const list =
    (Array.isArray(listRaw) ? listRaw : null) ??
    findFirstArrayCandidate(dataRaw) ??
    findFirstArrayCandidate(root) ??
    [];

  return list.map((row, index) => {
    const item = asObject(row);
    return {
      id: asString(
        item._id ??
          item.id ??
          item.predictionId ??
          item.prediction_id ??
          item.messageId ??
          item.message_id,
        `prediction-${index + 1}`,
      ),
      message: asString(
        item.cleaned_message ??
          item.cleanedMessage ??
          item.message ??
          item.text ??
          item.content ??
          item.caption ??
          item.body,
        "No message",
      ),
      userName: asString(
        item.actor_name ??
          item.actorName ??
          item.userName ??
          item.user_name ??
          item.username ??
          item.user ??
          "unknown",
      ),
      userId: asString(
        item.userId ??
          item.user_id ??
          item.uid ??
          item.senderId ??
          item.sender_id ??
          "unknown",
      ),
      risk: normalizeRisk(
        item.risk ??
          item.riskLevel ??
          item.risk_level ??
          item.severity,
      ),
    };
  });
}

export async function getModerationPredictions(scanId: string): Promise<ModerationPrediction[]> {
  const encoded = encodeURIComponent(scanId);
  const res = await fetch(
    `${BASE_URL}${MODERATION_PREDICTIONS_ROUTE}?scan_id=${encoded}`,
    {
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
  );

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

  return parseModerationPredictions(body);
}

export async function flagModerationUser(payload: FlagUserPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}${MODERATION_FLAG_USER_ROUTE}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prediction_id: payload.predictionId,
      scan_id: payload.scanId,
      user_id: payload.userId,
      actor_name: payload.actorName,
      cleaned_message: payload.message,
      reason: "Repeated drug purchase messages",
    }),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();
    const message =
      (typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message) ||
      (typeof body === "string" && body) ||
      "Failed to flag user.";
    throw new Error(message);
  }
}

export async function cancelModerationFlag(payload: FlagUserPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}${MODERATION_CANCEL_FLAG_ROUTE}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prediction_id: payload.predictionId,
      scan_id: payload.scanId,
      user_id: payload.userId,
      actor_name: payload.actorName,
      cleaned_message: payload.message,
      cancel_reason: "False positive after review",
    }),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();
    const message =
      (typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message) ||
      (typeof body === "string" && body) ||
      "Failed to cancel flag.";
    throw new Error(message);
  }
}
