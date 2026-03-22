import { useUserStore } from "@/stores/user-store";
import { waitForPersistHydration } from "@/lib/wait-for-persist-hydration";

const API_BASE = "/backend";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  await waitForPersistHydration();

  const userId = useUserStore.getState().userId;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) {
    headers["X-User-Id"] = userId;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorData: { code: string; message: string };
    try {
      const json = await res.json();
      errorData = json.error ?? { code: "UNKNOWN", message: res.statusText };
    } catch {
      errorData = { code: "UNKNOWN", message: res.statusText };
    }

    if (errorData.code === "USER_NOT_FOUND") {
      useUserStore.getState().clear();
      // Only prompt after persist has run — avoids opening the modal during
      // the brief window before rehydration when requests must not be trusted.
      const willPrompt =
        useUserStore.persist.hasHydrated() &&
        !useUserStore.getState().pendingAction;
      if (willPrompt) {
        useUserStore.getState().requestIdentity(() => {});
      }
    }

    throw new ApiError(errorData.code, errorData.message, res.status);
  }

  const json = await res.json();
  return json.data as T;
}
