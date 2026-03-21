import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  userId: string | null;
  displayName: string | null;
  _hasHydrated: boolean;

  setUser: (id: string, name: string) => void;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;

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
      _hasHydrated: false,

      setUser: (id, name) => set({ userId: id, displayName: name }),
      clear: () => set({ userId: null, displayName: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      pendingAction: null,
      requestIdentity: (onComplete) => set({ pendingAction: onComplete }),
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
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useUserStore.setState({ _hasHydrated: true });
        }
      },
    },
  ),
);
