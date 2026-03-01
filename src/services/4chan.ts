export type FourChanBoard = {
  id: string;
  board: string;
  title: string;
  type: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";
const BOARDS_ROUTE = "/v1/fourchan/boards";
const BOARDS_ROUTE_FALLBACK = "/fourchan/boards";
const SCRAPE_ROUTE = "/scrape/4chan";
let boardsInFlight: Promise<FourChanBoard[]> | null = null;

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

function normalizeBoard(item: unknown, index: number): FourChanBoard | null {
  const row = asObject(item);
  const boardCode = asString(row.board);
  const id = asString(
    row.id ??
      row._id ??
      row.board_id ??
      row.boardId ??
      boardCode ??
      `4chan-board-${index}`,
  );

  const title = asString(
    row.title ??
      row.name ??
      row.board_name ??
      row.boardName ??
      row.label,
  );

  const type = asString(row.type ?? "board");

  if (!boardCode && !title) return null;
  return { id, board: boardCode || id, title, type };
}

function parseBoards(payload: unknown): FourChanBoard[] {
  const root = asObject(payload);
  const data = asObject(root.data ?? root);
  const rawList = data.boards ?? data.items ?? data.results ?? root.boards;
  const list = Array.isArray(rawList) ? rawList : [];

  return list
    .map((item, index) => normalizeBoard(item, index))
    .filter((item): item is FourChanBoard => item !== null);
}

async function requestBoards(path: string): Promise<FourChanBoard[]> {
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

  return parseBoards(body);
}

export async function get4chanBoards(): Promise<FourChanBoard[]> {
  if (boardsInFlight) {
    return boardsInFlight;
  }

  boardsInFlight = (async () => {
    try {
      return await requestBoards(BOARDS_ROUTE);
    } catch {
      return requestBoards(BOARDS_ROUTE_FALLBACK);
    }
  })();

  try {
    return await boardsInFlight;
  } finally {
    boardsInFlight = null;
  }
}

export async function scrape4chan(board: string): Promise<void> {
  const scanId = createScanId();
  const res = await fetch(`${BASE_URL}${SCRAPE_ROUTE}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      board,
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
