export type JsonRequestOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  skipBodyOnSuccess?: boolean;
};

export type JsonResponse = {
  ok: boolean;
  status: number;
  body: unknown;
  headers: Headers;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError") return true;
  return /network|fetch|timeout/i.test(error.message);
}

function shouldRetryStatus(status: number, method: string): boolean {
  const normalized = method.toUpperCase();
  if (normalized !== "GET") return false;
  return status >= 500;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function getApiBaseUrl(raw = process.env.NEXT_PUBLIC_ADMIN_API_URL): string {
  const value = (raw ?? "").trim();
  if (!value) return "/api";
  if (value === "http://loc" || value === "https://loc") return "/api";
  if (value.startsWith("/")) return value.replace(/\/+$/, "") || "/api";
  try {
    const parsed = new URL(value);
    if (parsed.hostname === "loc") return "/api";
    return value.replace(/\/+$/, "");
  } catch {
    return "/api";
  }
}

export async function requestJson(
  url: string,
  init: RequestInit = {},
  options: JsonRequestOptions = {},
): Promise<JsonResponse> {
  const timeoutMs = options.timeoutMs ?? 15000;
  const retries = options.retries ?? 0;
  const retryDelayMs = options.retryDelayMs ?? 350;
  const skipBodyOnSuccess = options.skipBodyOnSuccess ?? false;
  const method = (init.method ?? "GET").toUpperCase();

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetchWithTimeout(url, init, timeoutMs);
      let body: unknown = "";
      if (!(skipBodyOnSuccess && res.ok)) {
        const contentType = res.headers.get("content-type") ?? "";
        const isJson = contentType.includes("application/json");
        body = isJson ? await res.json() : await res.text();
      }

      if (!res.ok && attempt < retries && shouldRetryStatus(res.status, method)) {
        attempt += 1;
        await sleep(retryDelayMs);
        continue;
      }

      return {
        ok: res.ok,
        status: res.status,
        body,
        headers: res.headers,
      };
    } catch (error) {
      if (attempt < retries && shouldRetryError(error)) {
        attempt += 1;
        await sleep(retryDelayMs);
        continue;
      }
      throw error;
    }
  }

  return {
    ok: false,
    status: 0,
    body: "Request failed.",
    headers: new Headers(),
  };
}
