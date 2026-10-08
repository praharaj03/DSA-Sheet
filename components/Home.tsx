"use client";

import { hueVar } from "@/lib/style";
import { COMPANY_STATS, TOPICS, TOTAL, countDone, pct } from "@/lib/data";
import CompanyLogo from "./CompanyLogo";

type Props = {
  done: Set<string>;
  ready: boolean;
  onOpen: (slug: string) => void;
  onReset: () => void;
};

export default function Home({ done, ready, onOpen, onReset }: Props) {
  const topicStats = TOPICS.map((t) => {
    const ids = t.questions.map((q) => q.id);
    const d = countDone(ids, done);
    return { topic: t, done: d, total: ids.length, p: pct(d, ids.length) };
  });

  const totalDone = topicStats.reduce((n, s) => n + s.done, 0);
  const overall = pct(totalDone, TOTAL);
  const topicsFinished = topicStats.filter((s) => s.done === s.total).length;
  const nextTopic = topicStats.find((s) => s.done < s.total);

  const handleReset = () => {
    if (window.confirm("Clear all progress? This can't be undone.")) onReset();
  };

  return (
    <div className="home">
      <header className="home-head">
        <div>
          <h1 className="title">DSA Sheet</h1>
          <p className="subtitle">Track your DSA progress across {TOPICS.length} topics.</p>
        </div>
        <div className="home-actions">
          {nextTopic && (
            <button className="btn btn-primary" onClick={() => onOpen(nextTopic.topic.slug)}>
              {totalDone === 0 ? "Start with" : "Continue with"} {nextTopic.topic.name}
            </button>
          )}
        </div>
      </header>

      <section className="stats" aria-label="Overall stats">
        <div className="stat">
          <span className="stat-value">{ready ? overall : 0}%</span>
          <span className="stat-label">Overall progress</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalDone}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{TOTAL - totalDone}</span>
          <span className="stat-label">Remaining</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {topicsFinished}
            <span className="stat-of">/{TOPICS.length}</span>
          </span>
          <span className="stat-label">Topics finished</span>
        </div>
      </section>

      <section className="field-wrap" aria-label="Every question as a cell">
        <div className="field-head">
          <h2 className="h2">Every question, one cell each</h2>
          <span className="muted">Filled cells are solved. Click a topic name to open it.</span>
        </div>
        <div className="field">
          {topicStats.map(({ topic, done: d }) => (
            <div className="field-group" key={topic.slug} style={hueVar(topic.hue)}>
              <button className="field-label" onClick={() => onOpen(topic.slug)}>
                {topic.name}
                <span className="field-count">
                  {d}/{topic.questions.length}
                </span>
              </button>
              <div className="cells">
                {topic.questions.map((q) => (
                  <span
                    key={q.id}
                    className={`cell ${done.has(q.id) ? "on" : ""}`}
                    title={`${q.title}${done.has(q.id) ? " (done)" : ""}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Progress by topic">
        <h2 className="h2">Progress by topic</h2>
        <div className="table-scroll">
          <table className="table topic-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th className="col-bar">Progress</th>
                <th className="num">Completed</th>
                <th className="num">Done / Total</th>
              </tr>
            </thead>
            <tbody>
              {topicStats.map(({ topic, done: d, total, p }) => (
                <tr key={topic.slug} style={hueVar(topic.hue)}>
                  <td>
                    <button className="link-btn" onClick={() => onOpen(topic.slug)}>
                      {topic.name}
                    </button>
                  </td>
                  <td className="col-bar">
                    <div
                      className="bar"
                      role="progressbar"
                      aria-valuenow={p}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${topic.name} progress`}
                    >
                      <div className="bar-fill" style={{ width: `${p}%` }} />
                    </div>
                  </td>
                  <td className="num strong">{p}%</td>
                  <td className="num muted">
                    {d} / {total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Most asked companies">
        <div className="field-head">
          <h2 className="h2">Most asked companies</h2>
          <span className="muted">How many of your sheet questions each company has asked, and how many you've done.</span>
        </div>
        <ul className="company-list">
          {COMPANY_STATS.slice(0, 12).map(({ company, ids }) => {
            const d = countDone(ids, done);
            const p = pct(d, ids.length);
            return (
              <li className="company-row" key={company.name}>
                <CompanyLogo company={company} size={28} />
                <span className="company-name">{company.name}</span>
                <div className="bar bar-thin" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${p}%` }} />
                </div>
                <span className="company-count muted">
                  {d} / {ids.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="home-foot">
        <span className="muted">Progress is saved in this browser only.</span>
        <button className="link-btn danger" onClick={handleReset} disabled={totalDone === 0}>
          Reset progress
        </button>
      </footer>
    </div>
  );
}
