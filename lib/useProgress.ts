"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "dsa-tracker-progress-v1";

function save(s: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(s)));
  } catch {
    /* storage unavailable (private mode) - progress just won't persist */
  }
}

export function useProgress() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  // Read after mount so the static HTML and first client render match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(new Set<string>(JSON.parse(raw)));
    } catch {
      /* ignore corrupted data */
    }
    setReady(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      save(next);
      return next;
    });
  }, []);

  const setMany = useCallback((ids: string[], value: boolean) => {
    setDone((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
      }
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const empty = new Set<string>();
    save(empty);
    setDone(empty);
  }, []);

  return { done, ready, toggle, setMany, reset };
}
