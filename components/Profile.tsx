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
            {user.links?.leetcode && (
              <a className="profile-link" href={`https://leetcode.com/${user.links.leetcode}`} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>
                LeetCode
              </a>
            )}
            {user.links?.github && (
              <a className="profile-link" href={`https://github.com/${user.links.github}`} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </a>
            )}
            {user.links?.linkedin && (
              <a className="profile-link" href={`https://linkedin.com/in/${user.links.linkedin}`} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            )}
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
              Avatar
              {avatarDaysLeft > 0 && <span className="edit-cooldown muted">· locked {avatarDaysLeft}d</span>}
              <div className="avatar-input-wrap">
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-file"
                  className="avatar-file-input"
                  disabled={avatarDaysLeft > 0}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setForm(f => ({ ...f, avatarUrl: ev.target?.result as string }));
                    reader.readAsDataURL(file);
                  }}
                />
                <label htmlFor="avatar-file" className={`avatar-file-btn btn ${avatarDaysLeft > 0 ? "disabled" : ""}`}>
                  📁 From device
                </label>
                <span className="avatar-or muted">or</span>
                <input
                  className="input"
                  placeholder="Paste image URL"
                  value={form.avatarUrl.startsWith("data:") ? "" : form.avatarUrl}
                  disabled={avatarDaysLeft > 0}
                  onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
                  style={{ flex: 1, minWidth: 0 }}
                />
                {form.avatarUrl && (
                  <img src={form.avatarUrl} alt="preview" className="avatar-preview" />
                )}
              </div>
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
