import { getApiBaseUrl, requestJson } from "@/services/http";

export type StateThreatScore = {
  state: string;
  score: number;
};

const BASE_URL = getApiBaseUrl();
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

  const listCandidate =
    objectData.states ??
    objectData.stateScores ??
    objectData.state_scores ??
    objectData.items ??
    objectData.results ??
    root.states ??
    root.stateScores ??
    root.state_scores;

  if (Array.isArray(listCandidate)) {
    return listCandidate
      .map((item) => asObject(item))
      .map((item) => ({
        state: normalizeStateName(
          item.state ??
            item.stateName ??
            item.name ??
            item.region ??
            item.STATE,
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

  const entries = Object.entries(objectData);
  if (!entries.length) return [];

  return entries
    .map(([state, value]) => ({ state: normalizeStateName(state), score: normalizeScore(value) }))
    .filter((row) => row.state.length > 0);
}

export async function getStateThreatScores(): Promise<StateThreatScore[]> {
  const res = await requestJson(
    `${BASE_URL}${STATES_ROUTE}`,
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

  return parseStateScores(res.body);
}
