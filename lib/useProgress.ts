"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { QUESTION_IDS, validQuestionIds } from "./data";
import {
  applyChanges,
  parseCache,
  type PendingChanges,
  type ProgressData,
} from "./progress";
import { fetchJSON } from "./client";

export type SyncStatus = "loading" | "saving" | "saved" | "offline";
const EMPTY: ProgressData = {
  done: [],
  revision: 0,
  activityLog: {},
  currentStreak: 0,
  maxStreak: 0,
};

export function useProgress() {
  const { userId, isLoaded } = useAuth();
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const actions = useRef<{
    change: (ids: string[], value?: boolean) => void;
    retry: () => void;
  }>({ change: () => {}, retry: () => {} });

  useEffect(() => {
    if (!isLoaded || !userId) return;
    const key = `dsa-progress-v2:${userId}`;
    let active = true;
    let busy = false;
    let initialized = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let server = EMPTY;
    let cached: ReturnType<typeof parseCache> = null;
    try {
      cached = parseCache(localStorage.getItem(key));
    } catch {
      /* Private browsing can disable storage. */
    }
    let pending: PendingChanges = cached?.pending ?? {};
    let visible = cached?.done ?? [];
    setData({ ...EMPTY, done: visible });
    setAccount(userId);
    setReady(!!cached);
    setStatus("loading");

    const publish = () => {
      visible = applyChanges(server.done, pending);
      if (active) setData({ ...server, done: visible });
      try {
        localStorage.setItem(key, JSON.stringify({ done: visible, pending }));
        if (active) setRecoveryAvailable(true);
      } catch {
        if (active) setRecoveryAvailable(false);
        /* Remote sync still works. */
      }
    };

    const flush = async () => {
      if (busy || !active) return;
      busy = true;
      setStatus("saving");
      try {
        // Refresh before each batch, then reapply only this device's explicit edits.
        server = await fetchJSON<ProgressData>("/api/progress");
        if (!active) return;
        initialized = true;
        publish();
        setReady(true);
        let conflicts = 0;
        while (active && Object.keys(pending).length) {
          const snapshot = { ...pending };
          const response = await fetch("/api/progress", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            signal: AbortSignal.timeout(15_000),
            body: JSON.stringify({
              done: applyChanges(server.done, snapshot),
              revision: server.revision,
            }),
          });
          if (!active) return;
          if (response.status === 409 && conflicts++ < 3) {
            server = await fetchJSON<ProgressData>("/api/progress");
            if (!active) return;
            publish();
            continue;
          }
          if (!response.ok) throw new Error("Save failed");
          server = (await response.json()) as ProgressData;
          if (!active) return;
          // An edit made during the request has a different object identity and stays queued.
          for (const id of Object.keys(snapshot))
            if (pending[id] === snapshot[id]) delete pending[id];
          publish();
        }
        if (active) setStatus("saved");
      } catch {
        if (active) setStatus("offline");
      } finally {
        busy = false;
      }
    };

    actions.current = {
      change(ids, value) {
        if (!initialized && !cached) return;
        const current = new Set(visible);
        for (const id of validQuestionIds(ids))
          pending[id] = { value: value ?? !current.has(id) };
        // Cached offline data remains the base until a successful refresh.
        if (!initialized) server = { ...EMPTY, done: visible };
        publish();
        setStatus("saving");
        clearTimeout(timer);
        timer = setTimeout(() => {
          void flush();
        }, 350);
      },
      retry: () => {
        void flush();
      },
    };
    const resume = () => {
      if (document.visibilityState === "visible") void flush();
    };
    const leave = () => {
      clearTimeout(timer);
      if (Object.keys(pending).length) void flush();
    };
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pagehide", leave);
    void flush();
    return () => {
      active = false;
      clearTimeout(timer);
      actions.current = { change: () => {}, retry: () => {} };
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pagehide", leave);
    };
  }, [isLoaded, userId]);

  const toggle = useCallback((id: string) => actions.current.change([id]), []);
  const setMany = useCallback(
    (ids: string[], value: boolean) => actions.current.change(ids, value),
    [],
  );
  const reset = useCallback(
    () => actions.current.change([...QUESTION_IDS], false),
    [],
  );
  const retry = useCallback(() => actions.current.retry(), []);
  return {
    ...(account === userId ? data : EMPTY),
    done: new Set(account === userId ? data.done : []),
    ready: account === userId && ready,
    recoveryAvailable,
    status,
    toggle,
    setMany,
    reset,
    retry,
  };
}
