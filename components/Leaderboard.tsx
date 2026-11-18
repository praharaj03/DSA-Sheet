"use client";

import { useEffect, useState } from "react";
import { BADGES, BADGE_MAP } from "@/lib/badges";
import { COMPANY_STATS, ALL_QUESTIONS, TOPICS } from "@/lib/data";
import { computeStats } from "@/lib/badges";
import { fetchJSON } from "@/lib/client";
import Avatar from "./Avatar";

type Row = {
  rank: number;
  username: string;
  avatarUrl: string;
  totalSolved: number;
  topicsDone: number;
  badges: string[];
  score: number;
  isMe: boolean;
};

const MEDAL = ["🥇", "🥈", "🥉"];
const TOTAL = ALL_QUESTIONS.length;

export default function Leaderboard({ done }: { done: Set<string> }) {
  const [rows, setRows] = useState<Row[]>([]);
  const myDone = done;
  const myBadges = computeStats(done).badges;
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"rank" | "badges" | "companies">("rank");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchJSON<{ rows: Row[] }>("/api/leaderboard", {
      signal: controller.signal,
    })
      .then((data) => setRows(data.rows))
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  const me = rows.find((r) => r.isMe);

  return (
    <div className="lb-wrap">
      <header className="lb-head">
        <div>
          <h1 className="title">Leaderboard</h1>
          <span className="eyebrow">A little friendly momentum</span>
          <p className="subtitle">
            Learn together. Celebrate every milestone. Rankings show up to 50
            learners.
          </p>
        </div>
        {me && (
          <div className="lb-me-card">
            <Avatar
              url={me.avatarUrl}
              name={me.username}
              size={40}
              className="lb-avatar"
            />
            <div>
              <div className="lb-me-name">@{me.username}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Rank #{me.rank} · {me.score} pts
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="lb-tabs">
        {(["rank", "badges", "companies"] as const).map((t) => (
          <button
            key={t}
            className={`seg ${tab === t ? "on" : ""}`}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
          >
            {t === "rank"
              ? "Rankings"
              : t === "badges"
                ? "Your badges"
                : "Company coverage"}
          </button>
        ))}
      </div>

      {loading && <div className="empty">Loading…</div>}
      {error && (
        <div className="sync-banner" role="alert">
          <span>{error}</span>
          <button
            className="link-btn"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {tab === "rank" && (
        <p className="muted score-note">
          1 point per solved question · 10 per completed topic · 5 per completed
          company set. Refresh to see recent scores.{" "}
          <button
            className="link-btn"
            onClick={() => setAttempt((value) => value + 1)}
            disabled={loading}
          >
            Refresh
          </button>
        </p>
      )}

      {!loading && !error && tab === "rank" && (
        <div className="table-scroll">
          <table className="table lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th className="num">Score</th>
                <th className="num">Solved</th>
                <th className="num">Topics</th>
                <th>Top Badge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const topBadge = r.badges.length
                  ? BADGE_MAP.get(r.badges[r.badges.length - 1])
                  : null;
                return (
                  <tr key={r.username} className={r.isMe ? "lb-me-row" : ""}>
                    <td className="lb-rank">
                      {r.rank <= 3 ? (
                        MEDAL[r.rank - 1]
                      ) : (
                        <span className="muted">#{r.rank}</span>
                      )}
                    </td>
                    <td>
                      <div className="lb-user">
                        <Avatar
                          url={r.avatarUrl}
                          name={r.username}
                          size={30}
                          className="lb-avatar"
                        />
                        <span className="lb-username">@{r.username}</span>
                        {r.isMe && <span className="lb-you">you</span>}
                      </div>
                    </td>
                    <td className="num strong">{r.score}</td>
                    <td className="num">
                      <span style={{ color: "var(--accent)" }}>
                        {r.totalSolved}
                      </span>
                      <span className="muted">/{TOTAL}</span>
                    </td>
                    <td className="num muted">
                      {r.topicsDone}/{TOPICS.length}
                    </td>
                    <td>
                      {topBadge ? (
                        <span
                          className="badge-pill"
                          style={{
                            background: topBadge.color + "22",
                            color: topBadge.color,
                            border: `1px solid ${topBadge.color}55`,
                          }}
                        >
                          {topBadge.emoji} {topBadge.label}
                        </span>
                      ) : (
                        <span className="faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">No users yet. Be the first!</div>
          )}
        </div>
      )}

      {!loading && tab === "badges" && (
        <div className="badges-grid">
          {BADGES.map((b) => {
            const earned = myBadges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`badge-card ${earned ? "earned" : "locked"}`}
                style={earned ? { borderColor: b.color + "66" } : {}}
              >
                <span className="badge-emoji">{earned ? b.emoji : "🔒"}</span>
                <span
                  className="badge-label"
                  style={earned ? { color: b.color } : {}}
                >
                  {b.label}
                </span>
                <span className="badge-desc muted">{b.description}</span>
                {earned && (
                  <span
                    className="badge-earned-tag"
                    style={{ background: b.color }}
                  >
                    Earned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "companies" && (
        <div className="company-matcher">
          <p className="muted" style={{ marginBottom: 20 }}>
            Your coverage of company-tagged questions in this sheet. Use it to
            plan your next practice session.
          </p>
          <div className="cm-grid">
            {COMPANY_STATS.filter(({ ids }) => ids.length >= 3)
              .slice(0, 30)
              .map(({ company, ids }) => {
                const solved = ids.filter((id) => myDone.has(id)).length;
                const p = Math.round((solved / ids.length) * 100);
                const tier =
                  p >= 80
                    ? "strong"
                    : p >= 50
                      ? "mid"
                      : p >= 20
                        ? "weak"
                        : "none";
                return (
                  <div key={company.name} className={`cm-card cm-${tier}`}>
                    <div className="cm-top">
                      <span className="cm-name">{company.name}</span>
                      <span
                        className="cm-pct"
                        style={{
                          color:
                            tier === "strong"
                              ? "var(--accent)"
                              : tier === "mid"
                                ? "#f39c12"
                                : "var(--mute)",
                        }}
                      >
                        {p}%
                      </span>
                    </div>
                    <div className="cm-bar-wrap">
                      <div
                        className="cm-bar-fill"
                        style={{
                          width: `${p}%`,
                          background:
                            tier === "strong"
                              ? "var(--accent)"
                              : tier === "mid"
                                ? "#f39c12"
                                : tier === "weak"
                                  ? "#e74c3c"
                                  : "var(--line-2)",
                        }}
                      />
                    </div>
                    <div className="cm-sub muted">
                      {solved}/{ids.length} solved
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
