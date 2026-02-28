export type AdminRole = "SUPER_ADMIN" | "SUB_ADMIN";
export type AdminStatus = "ACTIVE" | "INACTIVE";

export type AdminRecord = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  mobile: string;
  created: string;
};

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  mobile?: string;
};

export type PutAdminPayload = {
  name: string;
  email: string;
  role: AdminRole;
  status?: AdminStatus;
  mobile?: string;
};

export type PatchAdminPayload = Partial<PutAdminPayload> & {
  password?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "/api";
const ADMINS_RESOURCE_PATH = "/admins";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const validationMessage =
      typeof body === "object" && body !== null && "errors" in body
        ? (() => {
            const errors = (body as { errors?: unknown }).errors;
            if (!errors) return "";
            if (Array.isArray(errors)) {
              const first = errors[0];
              if (typeof first === "string") return first;
              if (
                first &&
                typeof first === "object" &&
                "message" in first &&
                typeof (first as { message?: unknown }).message === "string"
              ) {
                return (first as { message: string }).message;
              }
              return "";
            }
            if (typeof errors === "object") {
              const firstValue = Object.values(errors as Record<string, unknown>)[0];
              if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
                return firstValue[0];
              }
              if (typeof firstValue === "string") return firstValue;
            }
            return "";
          })()
        : "";
    const message =
      validationMessage ||
      (typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message) ||
      (typeof body === "string" && body) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function normalizeRole(value: unknown): AdminRole {
  const role = String(value ?? "").toUpperCase();
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "ADMIN" || role === "SUB_ADMIN") return "SUB_ADMIN";
  return "SUB_ADMIN";
}

function normalizeStatus(value: unknown): AdminStatus {
  if (value === 1 || value === "1" || value === true) return "ACTIVE";
  if (value === 0 || value === "0" || value === false) return "INACTIVE";
  const status = String(value ?? "").toUpperCase();
  return status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
}

function toApiStatus(status: AdminStatus): "1" | "0" {
  return status === "ACTIVE" ? "1" : "0";
}

function toApiRole(role: AdminRole): "SUPER_ADMIN" | "ADMIN" {
  return role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
}

function buildUpdatePayload(payload: PutAdminPayload) {
  return {
    name: payload.name,
    email: payload.email,
    role: toApiRole(payload.role),
    ...(payload.status ? { status: toApiStatus(payload.status) } : {}),
    ...(payload.mobile ? { mobile: payload.mobile } : {}),
    ...(payload.mobile ? { mobileNo: payload.mobile } : {}),
    ...(payload.mobile ? { phone: payload.mobile } : {}),
  };
}

function normalizeAdmin(input: Record<string, unknown>): AdminRecord {
  return {
    id: String(input.id ?? input._id ?? ""),
    name: String(input.name ?? input.fullName ?? ""),
    email: String(input.email ?? ""),
    role: normalizeRole(input.role),
    status: normalizeStatus(input.status),
    mobile: String(input.mobile ?? input.mobileNo ?? input.phone ?? ""),
    created: String(input.created ?? input.createdAt ?? ""),
  };
}

function toRecordArray(payload: unknown): AdminRecord[] {
  const unwrapped = unwrapData<unknown>(payload);
  if (Array.isArray(unwrapped)) {
    return unwrapped.map((item) => normalizeAdmin(item as Record<string, unknown>));
  }
  if (unwrapped && typeof unwrapped === "object" && "items" in unwrapped) {
    const items = (unwrapped as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items.map((item) => normalizeAdmin(item as Record<string, unknown>));
    }
  }
  return [];
}

export async function getAdmins(): Promise<AdminRecord[]> {
  const payload = await request<unknown>(ADMINS_RESOURCE_PATH, { method: "GET" });
  return toRecordArray(payload);
}

export async function getAdminById(id: string): Promise<AdminRecord | null> {
  const payload = await request<unknown>(`${ADMINS_RESOURCE_PATH}/${id}`, {
    method: "GET",
  });
  const unwrapped = unwrapData<unknown>(payload);
  if (!unwrapped || typeof unwrapped !== "object") return null;
  return normalizeAdmin(unwrapped as Record<string, unknown>);
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminRecord> {
  const createPayload = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: toApiRole(payload.role),
    status: "1",
    ...(payload.mobile ? { mobile: payload.mobile } : {}),
    ...(payload.mobile ? { mobileNo: payload.mobile } : {}),
    ...(payload.mobile ? { phone: payload.mobile } : {}),
  };

  const response = await request<unknown>(ADMINS_RESOURCE_PATH, {
    method: "POST",
    body: JSON.stringify(createPayload),
  });
  const unwrapped = unwrapData<unknown>(response);
  return normalizeAdmin((unwrapped ?? {}) as Record<string, unknown>);
}

export async function updateAdminPut(
  id: string,
  payload: PutAdminPayload,
): Promise<AdminRecord> {
  const updatePayload = buildUpdatePayload(payload);

  try {
    const response = await request<unknown>(`${ADMINS_RESOURCE_PATH}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });
    const unwrapped = unwrapData<unknown>(response);
    return normalizeAdmin((unwrapped ?? {}) as Record<string, unknown>);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    const isMethodNotAllowed =
      message.includes("405") || message.toLowerCase().includes("method not allowed");

    if (!isMethodNotAllowed) {
      throw error;
    }

    const fallback = await request<unknown>(`${ADMINS_RESOURCE_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updatePayload),
    });
    const unwrapped = unwrapData<unknown>(fallback);
    return normalizeAdmin((unwrapped ?? {}) as Record<string, unknown>);
  }
}

export async function patchAdmin(
  id: string,
  payload: PatchAdminPayload,
): Promise<AdminRecord> {
  const nextRole = payload.role ? { role: toApiRole(payload.role) } : {};
  const nextPayload = {
    ...payload,
    ...nextRole,
    ...(payload.status ? { status: toApiStatus(payload.status) } : {}),
  };
  const response = await request<unknown>(`${ADMINS_RESOURCE_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(nextPayload),
  });
  const unwrapped = unwrapData<unknown>(response);
  return normalizeAdmin((unwrapped ?? {}) as Record<string, unknown>);
}

export async function deleteAdmin(id: string): Promise<void> {
  await request<unknown>(`${ADMINS_RESOURCE_PATH}/${id}`, {
    method: "DELETE",
  });
}
