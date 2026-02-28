export type DiscordChannel = {
  id: string;
  title: string;
  type: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";
const CHANNELS_ROUTE = "/v1/discord/channels";
const CHANNELS_ROUTE_FALLBACK = "/discord/channels";
const SCRAPE_ROUTE = "/scrape/discord";
let discordChannelsInFlight: Promise<DiscordChannel[]> | null = null;

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

function normalizeChannel(item: unknown, index: number): DiscordChannel | null {
  const row = asObject(item);
  const id = asString(
    row.id ??
      row._id ??
      row.channelId ??
      row.channel_id ??
      row.discordChannelId ??
      row.discord_channel_id ??
      `discord-channel-${index}`,
  );

  const title = asString(
    row.title ??
      row.name ??
      row.channel_name ??
      row.channelName ??
      row.channel_name ??
      row.channelTitle ??
      row.channel_title,
  );

  const type = asString(row.type ?? row.channelType ?? row.channel_type ?? "channel");

  if (!title) return null;
  return { id, title, type };
}

function parseChannels(payload: unknown): DiscordChannel[] {
  const root = asObject(payload);
  const data = root.data ?? root;

  if (!Array.isArray(data)) return [];

  const nested = data
    .map((row) => asObject(row))
    .flatMap((guild) => {
      const channels = guild.channels;
      return Array.isArray(channels) ? channels : [];
    });

  const sourceList = nested.length > 0 ? nested : data;

  return sourceList
    .map((item, index) => normalizeChannel(item, index))
    .filter((item): item is DiscordChannel => item !== null);
}

async function requestChannels(path: string): Promise<DiscordChannel[]> {
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

export async function getDiscordChannels(): Promise<DiscordChannel[]> {
  if (discordChannelsInFlight) {
    return discordChannelsInFlight;
  }

  discordChannelsInFlight = (async () => {
    try {
      return await requestChannels(CHANNELS_ROUTE);
    } catch {
      return requestChannels(CHANNELS_ROUTE_FALLBACK);
    }
  })();

  try {
    return await discordChannelsInFlight;
  } finally {
    discordChannelsInFlight = null;
  }
}

export async function scrapeDiscord(channelId: string): Promise<void> {
  const scanId = createScanId();
  const res = await fetch(`${BASE_URL}${SCRAPE_ROUTE}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel_id: channelId,
      scan_id: scanId,
      scanId,
    }),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(extractErrorMessage(body, res.status));
  }
}
