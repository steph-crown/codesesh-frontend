"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type LandingHeroActions = {
  createSession: () => void;
  openJoinDialog: () => void;
};

type Ctx = {
  register: (actions: LandingHeroActions) => void;
  unregister: () => void;
  createSession: () => void;
  openJoinDialog: () => void;
};

const LandingHeroActionsContext = createContext<Ctx | null>(null);

export function LandingHeroActionsProvider({ children }: { children: ReactNode }) {
  const actionsRef = useRef<LandingHeroActions | null>(null);

  const register = useCallback((actions: LandingHeroActions) => {
    actionsRef.current = actions;
  }, []);

  const unregister = useCallback(() => {
    actionsRef.current = null;
  }, []);

  const createSession = useCallback(() => {
    actionsRef.current?.createSession();
  }, []);

  const openJoinDialog = useCallback(() => {
    actionsRef.current?.openJoinDialog();
  }, []);

  const value = useMemo(
    () => ({ register, unregister, createSession, openJoinDialog }),
    [register, unregister, createSession, openJoinDialog],
  );

  return (
    <LandingHeroActionsContext.Provider value={value}>
      {children}
    </LandingHeroActionsContext.Provider>
  );
}

export function useLandingHeroActions(): Ctx {
  const v = useContext(LandingHeroActionsContext);
  if (!v) {
    throw new Error(
      "useLandingHeroActions must be used within LandingHeroActionsProvider",
    );
  }
  return v;
}
