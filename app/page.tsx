"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Home from "@/components/Home";
import Sidebar from "@/components/Sidebar";
import TopicView from "@/components/TopicView";
import Leaderboard from "@/components/Leaderboard";
import UsernameSetup from "@/components/UsernameSetup";
import { TOPICS, TOTAL, pct } from "@/lib/data";
import { useProgress } from "@/lib/useProgress";

export default function Page() {
  const { isLoaded, isSignedIn } = useAuth();
  const { done, ready, toggle, setMany, reset } = useProgress();
  const [view, setView] = useState("home");
  const [userReady, setUserReady] = useState(false); // has username
  const [checkingUser, setCheckingUser] = useState(true);

  // Check if user has a username
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch("/api/user")
      .then((r) => r.json())
      .then(({ user }) => {
        setUserReady(!!user);
        setCheckingUser(false);
      })
      .catch(() => setCheckingUser(false));
  }, [isLoaded, isSignedIn]);

  // Restore view from URL hash
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "leaderboard") { setView("leaderboard"); return; }
      setView(TOPICS.some((t) => t.slug === h) ? h : "home");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const navigate = useCallback((next: string) => {
    window.location.hash = next === "home" ? "" : next;
    setView(next);
    window.scrollTo({ top: 0 });
  }, []);

  const topic = TOPICS.find((t) => t.slug === view);
  const overall = pct(done.size, TOTAL);

  if (!isLoaded || checkingUser) return null;

  // Show username setup if not set
  if (!userReady) return <UsernameSetup onDone={() => setUserReady(true)} />;

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")}>
          DSA Sheet
        </button>
        <div className="topbar-progress" aria-label="Overall progress">
          <div className="bar bar-thin" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${ready ? overall : 0}%` }} />
          </div>
          <span className="topbar-text">
            {ready ? done.size : 0}/{TOTAL} · {ready ? overall : 0}%
          </span>
        </div>
        <UserButton />
      </header>

      <div className="layout">
        <Sidebar active={view} done={done} onNavigate={navigate} />
        <main className="main">
          {view === "leaderboard" ? (
            <Leaderboard />
          ) : topic ? (
            <TopicView key={topic.slug} topic={topic} done={done} onToggle={toggle} onSetMany={setMany} />
          ) : (
            <Home done={done} ready={ready} onOpen={navigate} onReset={reset} />
          )}
        </main>
      </div>
    </div>
  );
}
