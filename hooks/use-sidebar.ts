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

let mobileOpenValue = false;
let mobileListeners: Array<() => void> = [];

function mobileSubscribe(cb: () => void) {
  mobileListeners.push(cb);
  return () => {
    mobileListeners = mobileListeners.filter((l) => l !== cb);
  };
}

function getMobileSnapshot(): boolean {
  return mobileOpenValue;
}

function notifyMobile() {
  mobileListeners.forEach((l) => l());
}

export function useSidebar() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const mobileOpen = useSyncExternalStore(mobileSubscribe, getMobileSnapshot, () => false);

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

  const setMobileOpen = useCallback((value: boolean) => {
    mobileOpenValue = value;
    notifyMobile();
  }, []);

  return { collapsed, toggle, setCollapsed, mobileOpen, setMobileOpen };
}
