"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { UserButton, useAuth } from "@clerk/nextjs";
import Home from "./Home";
import Sidebar from "./Sidebar";
import TopicView from "./TopicView";
import UsernameSetup from "./UsernameSetup";
import Loading from "./Loading";
import Icon, { type IconName } from "./Icon";
import { TOPICS, TOTAL, pct } from "@/lib/data";
import { useProgress } from "@/lib/useProgress";
import { fetchJSON } from "@/lib/client";
import type { UserProfile } from "@/lib/profile";

const Leaderboard = dynamic(() => import("./Leaderboard"), {
  loading: () => <Loading />,
});
const Profile = dynamic(() => import("./Profile"), {
  loading: () => <Loading />,
});
const Pricing = dynamic(() => import("./Pricing"), {
  loading: () => <Loading />,
});
const NAV: { id: string; label: string; icon: IconName }[] = [
  { id: "home", label: "Overview", icon: "grid" },
  { id: "leaderboard", label: "Leaderboard", icon: "trophy" },
  { id: "profile", label: "My profile", icon: "user" },
  { id: "pricing", label: "Membership", icon: "spark" },
];

export default function DashboardClient() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const progress = useProgress();
  const { done, ready, status, toggle, setMany, reset, retry } = progress;
  const [location, setLocation] = useState("home");
  const [profileState, setProfileState] = useState<
    "loading" | "setup" | "ready" | "error"
  >("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const controller = new AbortController();
    setProfileState("loading");
    fetchJSON<{ user: UserProfile | null }>("/api/user", {
      signal: controller.signal,
    })
      .then(({ user }) => setProfileState(user ? "ready" : "setup"))
      .catch(() => {
        if (!controller.signal.aborted) setProfileState("error");
      });
    return () => controller.abort();
  }, [isLoaded, isSignedIn, userId, attempt]);

  useEffect(() => {
    const readHash = () => {
      setLocation(window.location.hash.slice(1) || "home");
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  const navigate = useCallback((next: string) => {
    window.location.hash = next === "home" ? "home" : next;
    setLocation(next);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true }),
    );
  }, []);
  const [rawView, search = ""] = location.split("?");
  const topic = TOPICS.find((item) => item.slug === rawView);
  const view =
    topic || NAV.some((item) => item.id === rawView) ? rawView : "home";
  const query = new URLSearchParams(search).get("q") ?? "";
  const overall = pct(done.size, TOTAL);

  if (!isLoaded || profileState === "loading") return <Loading />;
  if (profileState === "error")
    return (
      <div className="full-state">
        <div className="state-card">
          <Icon name="cloud" size={32} />
          <h1 className="h2">Your workspace is taking a moment</h1>
          <p className="muted">
            We couldn't load your profile. Your progress is safe.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  if (profileState === "setup")
    return <UsernameSetup onDone={() => setProfileState("ready")} />;

  return (
    <div className="shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="DSA Sheet overview"
        >
          <span className="brand-mark">&lt;/&gt;</span>
          <span>
            DSA<span className="brand-light">sheet</span>
            <span className="brand-caption">THE PRACTICE WORKSPACE</span>
          </span>
        </button>
        <nav className="primary-nav" aria-label="Main navigation">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`primary-nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-account">
          <span className={`sync-status sync-${status}`} role="status">
            <span className="status-dot" />
            {status === "saved"
              ? "All changes saved"
              : status === "saving"
                ? "Saving progress…"
                : status === "offline"
                  ? "Sync paused"
                  : "Connecting…"}
          </span>
          <UserButton />
        </div>
      </header>
      <div className="layout">
        <Sidebar active={view} done={done} onNavigate={navigate} />
        <main className="main" id="main-content" tabIndex={-1}>
          <div className="workspace-meta">
            <span>
              <Icon name="book" size={14} /> Your learning workspace{" "}
              <span className="faint">/</span>{" "}
              <span className="strong">
                {topic?.name ?? NAV.find((item) => item.id === view)?.label}
              </span>
            </span>
            <span className="workspace-progress">
              {done.size}
              <span className="faint"> / {TOTAL} solved</span>
              <span className="mini-progress">
                <span style={{ width: `${overall}%` }} />
              </span>
            </span>
          </div>
          {status === "offline" && (
            <div className="sync-banner" role="alert">
              <span>
                {ready
                  ? progress.recoveryAvailable
                    ? "Your changes are saved on this device. Reconnect to sync them to your account."
                    : "Your changes are only in this tab. Keep it open and retry sync."
                  : "We couldn't load your progress. Please reconnect to continue."}
              </span>
              <button className="link-btn" onClick={retry}>
                Retry sync
              </button>
            </div>
          )}
          {!ready ? (
            <Loading label="Loading your progress" />
          ) : (
            <div className="page-transition" key={view}>
              {view === "leaderboard" ? (
                <Leaderboard done={done} />
              ) : view === "profile" ? (
                <Profile
                  done={done}
                  activityLog={progress.activityLog}
                  currentStreak={progress.currentStreak}
                  maxStreak={progress.maxStreak}
                />
              ) : view === "pricing" ? (
                <Pricing onPractice={() => navigate("home")} />
              ) : topic ? (
                <TopicView
                  key={`${topic.slug}:${query}`}
                  topic={topic}
                  initialQuery={query}
                  done={done}
                  onToggle={toggle}
                  onSetMany={setMany}
                />
              ) : (
                <Home
                  done={done}
                  ready={ready}
                  onOpen={navigate}
                  onReset={reset}
                />
              )}
            </div>
          )}
          <footer className="workspace-footer">
            <span>Built for a little progress, every day.</span>
            <span>
              Practice with purpose <span className="accent">↗</span>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
