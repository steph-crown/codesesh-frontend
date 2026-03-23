import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  userId: string | null;
  displayName: string | null;
  color: string | null;

  setUser: (id: string, name: string, color: string) => void;
  clear: () => void;

  pendingAction: (() => void) | null;
  requestIdentity: (onComplete: () => void) => void;
  resolvePending: () => void;
  cancelPending: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userId: null,
      displayName: null,
      color: null,

      setUser: (id, name, color) => {
        set({ userId: id, displayName: name, color });
      },
      clear: () => {
        set({ userId: null, displayName: null, color: null });
      },

      pendingAction: null,
      requestIdentity: (onComplete) => {
        set({ pendingAction: onComplete });
      },
      resolvePending: () => {
        const action = get().pendingAction;
        set({ pendingAction: null });
        action?.();
      },
      cancelPending: () => set({ pendingAction: null }),
    }),
    {
      name: "codesesh-user",
      partialize: (state) => ({
        userId: state.userId,
        displayName: state.displayName,
        color: state.color,
      }),
    },
  ),
);
