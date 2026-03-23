"use client";

import { useUserStore } from "@/stores/user-store";
import { useUserPersistHydrated } from "@/hooks/use-user-persist-hydrated";

/**
 * True only after localStorage has been merged into the user store **and**
 * a `userId` is present. Use this for React Query `enabled` on any request
 * that sends `X-User-Id`, so queries never schedule until persist + user id
 * are both valid (complements `waitForPersistHydration` in `apiFetch`).
 */
export function useAuthReady() {
  const hydrated = useUserPersistHydrated();
  const userId = useUserStore((s) => s.userId);
  return hydrated && !!userId;
}
