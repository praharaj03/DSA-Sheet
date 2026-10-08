"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const LS_KEY = "dsa-tracker-progress-v1";

function lsLoad(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function lsSave(s: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(Array.from(s))); } catch { /* ignore */ }
}

export function useProgress() {
  const { isSignedIn, isLoaded } = useAuth();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load progress on mount / auth change
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      fetch("/api/progress")
        .then((r) => r.json())
        .then(({ done: ids }) => {
          setDone(new Set<string>(ids));
          setReady(true);
        })
        .catch(() => {
          setDone(lsLoad());
          setReady(true);
        });
    } else {
      setDone(lsLoad());
      setReady(true);
    }
  }, [isLoaded, isSignedIn]);

  // Debounced sync to MongoDB
  const syncRemote = useCallback((next: Set<string>) => {
    if (!isSignedIn) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: Array.from(next) }),
      }).catch(() => {});
    }, 600);
  }, [isSignedIn]);

  const update = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    setDone((prev) => {
      const next = updater(prev);
      lsSave(next);
      syncRemote(next);
      return next;
    });
  }, [syncRemote]);

  const toggle = useCallback((id: string) => {
    update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [update]);

  const setMany = useCallback((ids: string[], value: boolean) => {
    update((prev) => {
      const next = new Set(prev);
      for (const id of ids) value ? next.add(id) : next.delete(id);
      return next;
    });
  }, [update]);

  const reset = useCallback(() => {
    update(() => new Set());
  }, [update]);

  return { done, ready, toggle, setMany, reset };
}
