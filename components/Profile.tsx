"use client";

import { useEffect, useMemo, useState } from "react";
import { BADGES, BADGE_MAP, computeStats } from "@/lib/badges";
import { TOPICS, ALL_QUESTIONS, pct } from "@/lib/data";

type UserDoc = {
  username: string;
  avatarUrl: string;
  joinedAt: string;
  usernameChangedAt: string | null;
  avatarChangedAt: string | null;
  links: { leetcode: string; linkedin: string; github: string };
};

type Props = { done: Set<string> };

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
function daysLeft(changedAt: string | null) {
  if (!changedAt) return 0;
  const diff = Date.now() - new Date(changedAt).getTime();
  if (diff >= THIRTY_DAYS) return 0;
  return Math.ceil((THIRTY_DAYS - diff) / 86400000);
}

export default function Profile({ done }: Props) {
  const [user, setUser] = useState<UserDoc | null>(null);
  const [activityLog, setActivityLog] = useState<Record<string, number>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", avatarUrl: "", leetcode: "", linkedin: "", github: "" });
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(({ user }) => {
      if (!user) return;
      setUser(user);
      setForm({ username: user.username, avatarUrl: user.avatarUrl, leetcode: user.links?.leetcode ?? "", linkedin: user.links?.linkedin ?? "", github: user.links?.github ?? "" });
    });
    fetch("/api/progress").then(r => r.json()).then(d => {
      setActivityLog(d.activityLog ?? {});
      setCurrentStreak(d.currentStreak ?? 0);
      setMaxStreak(d.maxStreak ?? 0);
    });
  }, []);

  const stats = useMemo(() => computeStats(done), [done]);
  const topicStats = TOPICS.map(t => {
    const ids = t.questions.map(q => q.id);
    const d = ids.filter(id => done.has(id)).length;
    return { topic: t, d, total: ids.length, p: pct(d, ids.length) };
  });

  const save = async () => {
    setSaveError(""); setSaving(true);
    const body: Record<string, any> = { links: { leetcode: form.leetcode, linkedin: form.linkedin, github: form.github } };
    if (form.username !== user?.username) body.username = form.username;
    if (form.avatarUrl !== user?.avatarUrl) body.avatarUrl = form.avatarUrl;
    const res = await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setSaveError(data.error); return; }
    setUser(data.user);
    setEditing(false);
  };

  if (!user) return <div className="empty">Loading profile…</div>;

  const usernameDaysLeft = daysLeft(user.usernameChangedAt);
  const avatarDaysLeft = daysLeft(user.avatarChangedAt);

  return (
    <div className="profile-wrap">

      {/* ── Header card ── */}
      <div className="profile-card">
        <div className="profile-avatar-wrap">
          {user.avatarUrl
            ? <img src={user.avatarUrl} className="profile-avatar" alt={user.username} />
            : <span className="profile-avatar profile-avatar-fb">{user.username[0]?.toUpperCase()}</span>}
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h1 className="title" style={{ fontSize: 28 }}>@{user.username}</h1>
            <button className="btn" onClick={() => setEditing(e => !e)} style={{ fontSize: 13 }}>
              {editing ? "Cancel" : "✏️ Edit Profile"}
            </button>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Joined {new Date(user.joinedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
          <div className="profile-links">
            {user.links?.leetcode && <a className="profile-link" href={`https://leetcode.com/${user.links.leetcode}`} target="_blank" rel="noopener">⚡ LeetCode</a>}
            {user.links?.github   && <a className="profile-link" href={`https://github.com/${user.links.github}`}   target="_blank" rel="noopener">🐙 GitHub</a>}
            {user.links?.linkedin && <a className="profile-link" href={`https://linkedin.com/in/${user.links.linkedin}`} target="_blank" rel="noopener">💼 LinkedIn</a>}
          </div>
        </div>
      </div>

      {/* ── Edit form ── */}
      {editing && (
        <div className="profile-edit-card">
          <h2 className="h2">Edit Profile</h2>
          <div className="profile-edit-grid">
            <label className="edit-label">
              Username
              {usernameDaysLeft > 0 && <span className="edit-cooldown muted">· locked {usernameDaysLeft}d</span>}
              <div className="prefix-input-wrap">
                <span className="prefix-at">@</span>
                <input className="input prefix-input" value={form.username} disabled={usernameDaysLeft > 0}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
            </label>
            <label className="edit-label">
              Avatar URL
              {avatarDaysLeft > 0 && <span className="edit-cooldown muted">· locked {avatarDaysLeft}d</span>}
              <input className="input" placeholder="https://i.imgur.com/..." value={form.avatarUrl} disabled={avatarDaysLeft > 0}
                onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
            </label>
            <label className="edit-label">
              LeetCode
              <div className="prefix-input-wrap">
                <span className="prefix-text">leetcode.com/</span>
                <input className="input prefix-input" placeholder="username" value={form.leetcode}
                  onChange={e => setForm(f => ({ ...f, leetcode: e.target.value }))} />
              </div>
            </label>
            <label className="edit-label">
              GitHub
              <div className="prefix-input-wrap">
                <span className="prefix-text">github.com/</span>
                <input className="input prefix-input" placeholder="username" value={form.github}
                  onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
              </div>
            </label>
            <label className="edit-label">
              LinkedIn
              <div className="prefix-input-wrap">
                <span className="prefix-text">linkedin.com/in/</span>
                <input className="input prefix-input" placeholder="username" value={form.linkedin}
                  onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
              </div>
            </label>
          </div>
          {saveError && <p className="setup-error">{saveError}</p>}
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}>
        {[
          { v: stats.totalSolved, l: "Solved" },
          { v: `${pct(stats.totalSolved, ALL_QUESTIONS.length)}%`, l: "Progress" },
          { v: stats.topicsDone, l: "Topics done" },
          { v: currentStreak, l: "Current streak 🔥" },
          { v: maxStreak, l: "Max streak 🏆" },
        ].map(({ v, l }) => (
          <div className="stat" key={l}>
            <span className="stat-value" style={{ fontSize: 28 }}>{v}</span>
            <span className="stat-label">{l}</span>
          </div>
        ))}
      </div>

      {/* ── Streak calendar ── */}
      <StreakCalendar activityLog={activityLog} />

      {/* ── Badges ── */}
      <section>
        <h2 className="h2" style={{ marginBottom: 16 }}>Badges <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>({stats.badges.length}/{BADGES.length} earned)</span></h2>
        <div className="badges-grid">
          {BADGES.map(b => {
            const earned = stats.badges.includes(b.id);
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
      </section>

      {/* ── Topic progress ── */}
      <section>
        <h2 className="h2" style={{ marginBottom: 14 }}>Topic Progress</h2>
        <div className="table-scroll">
          <table className="table topic-table">
            <thead><tr><th>Topic</th><th className="col-bar">Progress</th><th className="num">%</th><th className="num">Done/Total</th></tr></thead>
            <tbody>
              {topicStats.map(({ topic, d, total, p }) => (
                <tr key={topic.slug}>
                  <td style={{ fontWeight: 500 }}>{topic.name}</td>
                  <td className="col-bar">
                    <div className="bar" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
                      <div className="bar-fill" style={{ width: `${p}%` }} />
                    </div>
                  </td>
                  <td className="num strong">{p}%</td>
                  <td className="num muted">{d}/{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

// ── Streak Calendar ────────────────────────────────────────────────────────────
function StreakCalendar({ activityLog }: { activityLog: Record<string, number> }) {
  const weeks = useMemo(() => buildCalendar(), []);
  const max = Math.max(1, ...Object.values(activityLog));

  return (
    <section>
      <h2 className="h2" style={{ marginBottom: 12 }}>Activity Calendar</h2>
      <div className="cal-wrap">
        <div className="cal-months">{getMonthLabels(weeks)}</div>
        <div className="cal-grid">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <span key={i} className="cal-day-label muted">{d}</span>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return <span key={`${wi}-${di}`} className="cal-cell empty" />;
              const count = activityLog[day] ?? 0;
              const intensity = count === 0 ? 0 : Math.ceil((count / max) * 4);
              return (
                <span
                  key={day}
                  className={`cal-cell lvl-${intensity}`}
                  title={count ? `${day}: ${count} solved` : day}
                />
              );
            })
          )}
        </div>
        <div className="cal-legend">
          <span className="muted" style={{ fontSize: 12 }}>Less</span>
          {[0,1,2,3,4].map(l => <span key={l} className={`cal-cell lvl-${l}`} />)}
          <span className="muted" style={{ fontSize: 12 }}>More</span>
        </div>
      </div>
    </section>
  );
}

function buildCalendar(): (string | null)[][] {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  // align start to Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks: (string | null)[][] = [];
  let cur = new Date(start);
  while (cur <= end) {
    const week: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const key = cur.toISOString().slice(0, 10);
      week.push(cur > end ? null : key);
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getMonthLabels(weeks: (string | null)[][]) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const day = week.find(Boolean);
    if (!day) return;
    const m = new Date(day).getMonth();
    if (m !== lastMonth) {
      labels.push({ label: new Date(day).toLocaleString("default", { month: "short" }), col: i + 2 });
      lastMonth = m;
    }
  });
  return (
    <div className="cal-month-row">
      {labels.map(({ label, col }) => (
        <span key={`${label}-${col}`} className="cal-month muted" style={{ gridColumn: col }}>{label}</span>
      ))}
    </div>
  );
}
