"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user-store";

/**
 * `true` after the persisted user slice has been rehydrated from storage.
 * Until then, `userId` may be stale `null` even when localStorage has a user —
 * never call `requestIdentity` / open the identity modal before this is true.
 */
export function useUserPersistHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    typeof globalThis.window !== "undefined"
      ? useUserStore.persist.hasHydrated()
      : false,
  );

  useEffect(() => {
    queueMicrotask(() => {
      if (useUserStore.persist.hasHydrated()) {
        setHydrated(true);
      }
    });
    const unsub = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
}
