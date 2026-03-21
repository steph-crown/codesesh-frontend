import { useUserStore } from "@/stores/user-store";

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
      return new Promise<T>((resolve, reject) => {
        useUserStore.getState().requestIdentity(() => {
          apiFetch<T>(path, options).then(resolve).catch(reject);
        });
      });
    }

    throw new ApiError(errorData.code, errorData.message, res.status);
  }

  const json = await res.json();
  return json.data as T;
}
