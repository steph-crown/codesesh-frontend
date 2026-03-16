"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  type Session,
  getSessions,
  createSession as createSessionUtil,
  deleteSession as deleteSessionUtil,
  renameSession as renameSessionUtil,
  getUser,
  saveUser,
  migrateLegacySessions,
  type UserProfile,
} from "@/lib/sessions";

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

let snapshotCache: Session[] | null = null;

function getSnapshot(): Session[] {
  if (!snapshotCache) snapshotCache = getSessions();
  return snapshotCache;
}

function invalidate() {
  snapshotCache = null;
  notify();
}

export function useSessions() {
  useEffect(() => {
    migrateLegacySessions();
    invalidate();
  }, []);

  const sessions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => [] as Session[],
  );

  const createSession = useCallback((username: string) => {
    const session = createSessionUtil(username);
    saveUser({ username });
    invalidate();
    return session;
  }, []);

  const deleteSession = useCallback((id: string) => {
    deleteSessionUtil(id);
    invalidate();
  }, []);

  const renameSession = useCallback((id: string, title: string) => {
    renameSessionUtil(id, title);
    invalidate();
  }, []);

  return { sessions, createSession, deleteSession, renameSession };
}

let userSnapshot: UserProfile | null | undefined = undefined;
let userListeners: Array<() => void> = [];

function userSubscribe(cb: () => void) {
  userListeners.push(cb);
  return () => {
    userListeners = userListeners.filter((l) => l !== cb);
  };
}

function getUserSnapshot(): UserProfile | null {
  if (userSnapshot === undefined) userSnapshot = getUser();
  return userSnapshot;
}

export function useUser() {
  const user = useSyncExternalStore(
    userSubscribe,
    getUserSnapshot,
    () => null,
  );
  return user;
}
