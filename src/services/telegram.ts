export type TelegramChannel = {
  id: string;
  title: string;
  username: string;
  scrapeKey: string;
  type: string;
  peerId: string;
};

export type TelegramScrapeRequest = {
  channelId?: string;
  channelTitle?: string;
  username: string;
  apexModel?: "small" | "large";
};

export type TelegramScrapeItem = {
  id: string;
  scanId: string;
  title: string;
  message: string;
  source: string;
  timestamp: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";
const CHANNELS_ROUTE = "/v1/telegram/channels";
const CHANNELS_ROUTE_FALLBACK = "/telegram/channels";
const SCRAPE_ROUTE = "/scrape/telegram";
let telegramChannelsInFlight: Promise<TelegramChannel[]> | null = null;

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string {
  return String(value ?? "").trim();
}

function createScanId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `scan_${Date.now()}_${randomPart}`;
}

function extractErrorMessage(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    if ("detail" in body && typeof body.detail === "string" && body.detail) {
      return body.detail;
    }
    if ("message" in body && typeof body.message === "string" && body.message) {
      return body.message;
    }
  }

  if (typeof body === "string" && body) {
    return body;
  }

  return `Request failed with status ${status}`;
}

function normalizeChannel(item: unknown, index: number): TelegramChannel | null {
  const row = asObject(item);

  const id = asString(
    row.id ??
      row._id ??
      row.channelId ??
      row.channel_id ??
      row.username ??
      row.handle ??
      row.link ??
      row.url ??
      `channel-${index}`,
  );

  const title = asString(
    row.title ??
      row.name ??
      row.channelTitle ??
      row.channel_title ??
      row.channelName ??
      row.channel_name ??
      row.username ??
      row.handle,
  );

  const rawUsername = asString(
    row.username ?? row.userName ?? row.user_name ?? row.handle ?? row.telegramUsername,
  );
  const normalizedUsername = rawUsername
    ? rawUsername.startsWith("@")
      ? rawUsername
      : `@${rawUsername}`
    : "";
  const peerId = asString(row.peer_id ?? row.peerId ?? row.id ?? "");
  const scrapeKey = asString(
    row.scrape_key ??
      row.scrapeKey ??
      row.scrapekey ??
      row.scrape_id ??
      row.scrapeId ??
      row.key ??
      normalizedUsername ??
      peerId,
    normalizedUsername || peerId,
  );
  const type = asString(row.type ?? row.channelType ?? "channel");

  if (!title) return null;
  return { id, title, username: rawUsername, scrapeKey, type, peerId };
}

function parseChannels(payload: unknown): TelegramChannel[] {
  const root = asObject(payload);
  const data = root.data ?? root;

  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => normalizeChannel(item, index))
    .filter((item): item is TelegramChannel => item !== null);
}

function normalizeScrapeItem(
  item: unknown,
  index: number,
  runId: string,
): TelegramScrapeItem | null {
  const row = asObject(item);
  const message = asString(
    row.message ?? row.text ?? row.content ?? row.caption ?? row.body,
  );

  if (!message) return null;

  const fallbackScanId = `${runId}-${index + 1}`;
  const scanId = asString(row.scan_id ?? row.scanId ?? row.scanID ?? fallbackScanId);

  return {
    id: asString(row.id ?? row._id ?? row.messageId ?? row.message_id ?? scanId),
    scanId,
    title: asString(row.title ?? row.channelTitle ?? row.channel_title ?? row.name ?? "Telegram"),
    message,
    source: asString(row.source ?? row.username ?? row.handle ?? row.channel ?? "telegram"),
    timestamp: asString(
      row.timestamp ?? row.createdAt ?? row.created_at ?? row.date ?? row.time ?? "",
    ),
  };
}

function parseScrapeItems(payload: unknown): TelegramScrapeItem[] {
  const root = asObject(payload);
  const data = root.data ?? root;
  const runId = `scan-${Date.now()}`;

  if (Array.isArray(data)) {
    return data
      .map((item, index) => normalizeScrapeItem(item, index, runId))
      .filter((item): item is TelegramScrapeItem => item !== null);
  }

  const dataObj = asObject(data);
  const listCandidate =
    dataObj.items ??
    dataObj.results ??
    dataObj.messages ??
    dataObj.posts ??
    dataObj.list;

  if (!Array.isArray(listCandidate)) return [];

  return listCandidate
    .map((item, index) => normalizeScrapeItem(item, index, runId))
    .filter((item): item is TelegramScrapeItem => item !== null);
}

async function requestChannels(path: string): Promise<TelegramChannel[]> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(extractErrorMessage(body, res.status));
  }

  return parseChannels(body);
}

async function requestScrape(
  bodyPayload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${BASE_URL}${SCRAPE_ROUTE}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  return { ok: res.ok, status: res.status, body };
}

export async function getTelegramChannels(): Promise<TelegramChannel[]> {
  if (telegramChannelsInFlight) {
    return telegramChannelsInFlight;
  }

  telegramChannelsInFlight = (async () => {
    try {
      return await requestChannels(CHANNELS_ROUTE);
    } catch {
      return requestChannels(CHANNELS_ROUTE_FALLBACK);
    }
  })();

  try {
    return await telegramChannelsInFlight;
  } finally {
    telegramChannelsInFlight = null;
  }
}

export async function scrapeTelegram(
  payload: TelegramScrapeRequest,
): Promise<TelegramScrapeItem[]> {
  const rawUsername = asString(payload.username);
  const username = rawUsername.startsWith("@") ? rawUsername : `@${rawUsername}`;
  const scanId = createScanId();
  const result = await requestScrape({
    scan_id: scanId,
    scanId,
    username,
    channelTitle: payload.channelTitle ?? "",
    apexModel: payload.apexModel ?? "small",
  });

  if (!result.ok) {
    throw new Error(extractErrorMessage(result.body, result.status));
  }

  return parseScrapeItems(result.body);
}
