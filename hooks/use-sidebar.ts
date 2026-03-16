"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "codesesh_sidebar_collapsed";

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

let cachedValue: boolean | null = null;

function getSnapshot(): boolean {
  if (cachedValue === null) {
    if (typeof globalThis.window === "undefined") return false;
    cachedValue = localStorage.getItem(STORAGE_KEY) === "true";
  }
  return cachedValue;
}

export function useSidebar() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => {
    const next = !getSnapshot();
    cachedValue = next;
    localStorage.setItem(STORAGE_KEY, String(next));
    notify();
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    cachedValue = value;
    localStorage.setItem(STORAGE_KEY, String(value));
    notify();
  }, []);

  return { collapsed, toggle, setCollapsed };
}
