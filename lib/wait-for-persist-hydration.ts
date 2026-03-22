import { useUserStore } from "@/stores/user-store";

/**
 * Zustand `persist` rehydrates from localStorage asynchronously. Until
 * `onFinishHydration` runs, `getState().userId` is still the initial `null`
 * even when `codesesh-user` already contains a user — so any `apiFetch`
 * that runs too early would omit `X-User-Id`, the API can respond with
 * errors that trigger `clear()` + identity modal, or race real requests.
 *
 * Call this at the start of every `apiFetch` (client) so the store has
 * merged persisted state before we read `userId`.
 */
let pendingHydration: Promise<void> | null = null;

export function waitForPersistHydration(): Promise<void> {
  if (typeof globalThis.window === "undefined") return Promise.resolve();
  if (useUserStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  if (pendingHydration === null) {
    pendingHydration = new Promise<void>((resolve) => {
      const finish = () => {
        pendingHydration = null;
        resolve();
      };
      const unsub = useUserStore.persist.onFinishHydration(() => {
        unsub();
        finish();
      });
    });
  }
  return pendingHydration;
}
