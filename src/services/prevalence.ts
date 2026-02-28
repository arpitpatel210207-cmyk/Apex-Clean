export type StateThreatScore = {
  state: string;
  score: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";
const STATES_ROUTE = "/ncb-score/states";

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

function normalizeStateName(raw: unknown): string {
  return String(raw ?? "").trim();
}

function normalizeScore(raw: unknown): number {
  const n = asNumber(raw, 0);
  return Math.min(Math.max(n, 0), 10);
}

function parseStateScores(payload: unknown): StateThreatScore[] {
  const root = asObject(payload);
  const data = root.data ?? root;

  if (Array.isArray(data)) {
    return data
      .map((item) => asObject(item))
      .map((item) => ({
        state: normalizeStateName(
          item.state ?? item.stateName ?? item.name ?? item.region ?? item.STATE,
        ),
        score: normalizeScore(
          item.score ??
            item.ncbScore ??
            item.ncb_score ??
            item.threatScore ??
            item.threat_score ??
            item.prevalence ??
            item.value,
        ),
      }))
      .filter((row) => row.state.length > 0);
  }

  const objectData = asObject(data);
  const entries = Object.entries(objectData);
  if (!entries.length) return [];

  return entries
    .map(([state, value]) => ({ state: normalizeStateName(state), score: normalizeScore(value) }))
    .filter((row) => row.state.length > 0);
}

export async function getStateThreatScores(): Promise<StateThreatScore[]> {
  const res = await fetch(`${BASE_URL}${STATES_ROUTE}`, {
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

  return parseStateScores(body);
}
