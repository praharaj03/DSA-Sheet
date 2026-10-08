"use client";

import { useEffect, useState } from "react";
import { BADGES, BADGE_MAP } from "@/lib/badges";
import { COMPANY_STATS, ALL_QUESTIONS } from "@/lib/data";

type Row = {
  rank: number;
  userId: string;
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

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"rank" | "badges" | "companies">("rank");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(({ rows }) => { setRows(rows ?? []); setLoading(false); });
  }, []);

  const me = rows.find((r) => r.isMe);

  return (
    <div className="lb-wrap">
      <header className="lb-head">
        <div>
          <h1 className="title">Leaderboard</h1>
          <p className="subtitle">{rows.length} coders competing · updated live</p>
        </div>
        {me && (
          <div className="lb-me-card">
            <Avatar url={me.avatarUrl} name={me.username} size={40} />
            <div>
              <div className="lb-me-name">@{me.username}</div>
              <div className="muted" style={{ fontSize: 13 }}>Rank #{me.rank} · {me.score} pts</div>
            </div>
          </div>
        )}
      </header>

      <div className="lb-tabs">
        {(["rank", "badges", "companies"] as const).map((t) => (
          <button key={t} className={`seg ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {t === "rank" ? "🏆 Rankings" : t === "badges" ? "🎖 Badges" : "🏢 Company Matcher"}
          </button>
        ))}
      </div>

      {loading && <div className="empty">Loading…</div>}

      {!loading && tab === "rank" && (
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
                const topBadge = r.badges.length ? BADGE_MAP.get(r.badges[r.badges.length - 1]) : null;
                return (
                  <tr key={r.userId} className={r.isMe ? "lb-me-row" : ""}>
                    <td className="lb-rank">
                      {r.rank <= 3 ? MEDAL[r.rank - 1] : <span className="muted">#{r.rank}</span>}
                    </td>
                    <td>
                      <div className="lb-user">
                        <Avatar url={r.avatarUrl} name={r.username} size={30} />
                        <span className="lb-username">@{r.username}</span>
                        {r.isMe && <span className="lb-you">you</span>}
                      </div>
                    </td>
                    <td className="num strong">{r.score}</td>
                    <td className="num">
                      <span style={{ color: "var(--accent)" }}>{r.totalSolved}</span>
                      <span className="muted">/{TOTAL}</span>
                    </td>
                    <td className="num muted">{r.topicsDone}/16</td>
                    <td>
                      {topBadge
                        ? <span className="badge-pill" style={{ background: topBadge.color + "22", color: topBadge.color, border: `1px solid ${topBadge.color}55` }}>
                            {topBadge.emoji} {topBadge.label}
                          </span>
                        : <span className="faint">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty">No users yet. Be the first!</div>}
        </div>
      )}

      {!loading && tab === "badges" && (
        <div className="badges-grid">
          {BADGES.map((b) => {
            const earned = me?.badges.includes(b.id) ?? false;
            return (
              <div key={b.id} className={`badge-card ${earned ? "earned" : "locked"}`} style={earned ? { borderColor: b.color + "66" } : {}}>
                <span className="badge-emoji">{earned ? b.emoji : "🔒"}</span>
                <span className="badge-label" style={earned ? { color: b.color } : {}}>{b.label}</span>
                <span className="badge-desc muted">{b.description}</span>
                {earned && <span className="badge-earned-tag" style={{ background: b.color }}>Earned</span>}
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "companies" && (
        <div className="company-matcher">
          <p className="muted" style={{ marginBottom: 20 }}>
            See which companies' full question sets you've mastered vs others on the leaderboard.
          </p>
          <div className="table-scroll">
            <table className="table lb-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="num">Questions</th>
                  {rows.slice(0, 5).map((r) => (
                    <th key={r.userId} className="num" title={`@${r.username}`}>
                      <Avatar url={r.avatarUrl} name={r.username} size={22} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPANY_STATS.slice(0, 20).map(({ company, ids }) => (
                  <tr key={company.name}>
                    <td className="lb-company-name">{company.name}</td>
                    <td className="num muted">{ids.length}</td>
                    {rows.slice(0, 5).map((r) => (
                      <td key={r.userId} className="num">
                        {r.badges.includes("faang_ready") || r.totalSolved >= ids.length
                          ? <span style={{ color: "var(--accent)" }}>✓</span>
                          : <span className="faint">·</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ url, name, size }: { url: string; name: string; size: number }) {
  if (url) return <img src={url} alt={name} width={size} height={size} className="lb-avatar" style={{ width: size, height: size }} />;
  return (
    <span className="lb-avatar lb-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {name[0]?.toUpperCase()}
    </span>
  );
}
