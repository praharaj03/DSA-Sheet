"use client";

import { hueVar } from "@/lib/style";
import { TOPICS, countDone, pct } from "@/lib/data";

type Props = {
  active: string;
  done: Set<string>;
  onNavigate: (view: string) => void;
};

export default function Sidebar({ active, done, onNavigate }: Props) {
  return (
    <nav className="sidebar" aria-label="Topics">
      <button
        className={`nav-item ${active === "home" ? "active" : ""}`}
        onClick={() => onNavigate("home")}
        aria-current={active === "home" ? "page" : undefined}
      >
        <span className="nav-name">Home</span>
      </button>

      <button
        className={`nav-item ${active === "leaderboard" ? "active" : ""}`}
        onClick={() => onNavigate("leaderboard")}
        aria-current={active === "leaderboard" ? "page" : undefined}
      >
        <span className="nav-name">🏆 Leaderboard</span>
      </button>

      <div className="nav-divider" />

      {TOPICS.map((t) => {
        const d = countDone(
          t.questions.map((q) => q.id),
          done
        );
        const p = pct(d, t.questions.length);
        return (
          <button
            key={t.slug}
            className={`nav-item ${active === t.slug ? "active" : ""}`}
            style={hueVar(t.hue)}
            onClick={() => onNavigate(t.slug)}
            aria-current={active === t.slug ? "page" : undefined}
          >
            <span className="nav-row">
              <span className="nav-name">{t.name}</span>
              <span className="nav-pct">{p}%</span>
            </span>
            <span className="nav-bar">
              <span className="nav-bar-fill" style={{ width: `${p}%` }} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
