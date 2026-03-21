"use client";

import { useCallback } from "react";
import { useUserStore } from "@/stores/user-store";

export function useRequireAuth() {
  const userId = useUserStore((s) => s.userId);
  const requestIdentity = useUserStore((s) => s.requestIdentity);

  return useCallback(
    (action: () => void) => {
      if (userId) {
        action();
      } else {
        requestIdentity(action);
      }
    },
    [userId, requestIdentity],
  );
}
