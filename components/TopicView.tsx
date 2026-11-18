"use client";

import { hueVar } from "@/lib/style";
import { useMemo, useState } from "react";
import { countDone, pct, type Topic } from "@/lib/data";
import CompanyLogo from "./CompanyLogo";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";
import Icon from "./Icon";
import { TopicIcon } from "@/lib/topicIcons";

type Props = {
  topic: Topic;
  initialQuery?: string;
  done: Set<string>;
  onToggle: (id: string) => void;
  onSetMany: (ids: string[], value: boolean) => void;
};

type Filter = "all" | "pending" | "done";
type Sort = "default" | "company" | "title" | "done-last";

const MAX_LOGOS = 6;

export default function TopicView({
  topic,
  initialQuery = "",
  done,
  onToggle,
  onSetMany,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [company, setCompany] = useState("");
  const [sort, setSort] = useState<Sort>("default");

  const ids = useMemo(() => topic.questions.map((q) => q.id), [topic]);
  const doneCount = countDone(ids, done);
  const total = ids.length;
  const p = pct(doneCount, total);

  const companyOptions = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of topic.questions)
      for (const c of q.companies) m.set(c.name, (m.get(c.name) ?? 0) + 1);
    return Array.from(m.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [topic]);

  const rows = useMemo(() => {
    const filtered = topic.questions.filter((q) => {
      if (filter === "done" && !done.has(q.id)) return false;
      if (filter === "pending" && done.has(q.id)) return false;
      if (company && !q.companies.some((c) => c.name === company)) return false;
      if (query && !q.title.toLowerCase().includes(query.trim().toLowerCase()))
        return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "company") return b.companies.length - a.companies.length;
      if (sort === "done-last")
        return (done.has(a.id) ? 1 : 0) - (done.has(b.id) ? 1 : 0);
      return a.n - b.n;
    });
  }, [topic, filter, company, query, sort, done]);

  const handleToggle = (id: string, title: string) => {
    const willBeDone = !done.has(id);
    onToggle(id);
    if (willBeDone) toast.success(`✓ ${title}`, { duration: 2000 });
    else toast(`Unmarked: ${title}`, { duration: 1500 });
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: `All ${total}` },
    { key: "pending", label: `Pending ${total - doneCount}` },
    { key: "done", label: `Done ${doneCount}` },
  ];

  return (
    <div className="topic" style={hueVar(topic.hue)}>
      <header className="topic-head">
        <span className="eyebrow">
          <TopicIcon slug={topic.slug} size={16} /> The study path ·{" "}
          {topic.questions.length} problems
        </span>
        <div className="topic-title-row">
          <h1 className="title">{topic.name}</h1>
          <div className="topic-pct">
            <span className="topic-pct-num">{p}%</span>
            <span className="muted">completed</span>
          </div>
        </div>
        <p className="subtitle">
          Build confidence one problem at a time. Mark a question solved when
          you're ready.
        </p>

        <div
          className="bar bar-lg"
          role="progressbar"
          aria-valuenow={p}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${topic.name} progress`}
        >
          <div className="bar-fill" style={{ width: `${p}%` }} />
        </div>

        <div className="chips">
          <span className="chip">
            <b>{doneCount}</b> done
          </span>
          <span className="chip">
            <b>{total - doneCount}</b> remaining
          </span>
          <span className="chip">
            <b>{total}</b> total
          </span>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search questions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search questions"
        />

        <select
          className="input select"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-label="Filter by company"
        >
          <option value="">All companies</option>
          {companyOptions.map(([name, count]) => (
            <option key={name} value={name}>
              {name} ({count})
            </option>
          ))}
        </select>

        <div className="segmented" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`seg ${filter === f.key ? "on" : ""}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="input select"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort questions"
        >
          <option value="default">Sort: Default</option>
          <option value="title">Sort: A → Z</option>
          <option value="company">Sort: Most asked</option>
          <option value="done-last">Sort: Pending first</option>
        </select>

        <div className="bulk">
          <button
            className="link-btn danger"
            onClick={() => setConfirmClear(true)}
            disabled={doneCount === 0}
          >
            Reset topic
          </button>
        </div>
      </div>

      <div className="question-summary">
        <span role="status">
          Showing <strong>{rows.length}</strong> of {total} questions
        </span>
        <span>
          Practice links open in a new tab <Icon name="external" size={12} />
        </span>
      </div>

      <div className="table-scroll">
        <table className="table q-table">
          <thead>
            <tr>
              <th className="col-check">
                <span className="sr-only">Done</span>
              </th>
              <th className="col-n">#</th>
              <th>Question</th>
              <th className="col-companies">Companies</th>
              <th className="col-remark">Remarks</th>
              <th className="col-links">Practice</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const isDone = done.has(q.id);
              const shown = q.companies.slice(0, MAX_LOGOS);
              const extra = q.companies.length - shown.length;
              return (
                <tr key={q.id} className={isDone ? "is-done" : ""}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      className="check"
                      checked={isDone}
                      onChange={() => handleToggle(q.id, q.title)}
                      aria-label={`Mark "${q.title}" as ${isDone ? "not done" : "done"}`}
                    />
                  </td>
                  <td className="col-n muted">{q.n}</td>
                  <td className="q-title">{q.title}</td>
                  <td className="col-companies">
                    <div className="logos">
                      {shown.map((c) => (
                        <CompanyLogo key={c.name} company={c} />
                      ))}
                      {extra > 0 && (
                        <span
                          className="logo-more"
                          title={q.companies
                            .slice(MAX_LOGOS)
                            .map((c) => c.name)
                            .join(", ")}
                        >
                          +{extra}
                        </span>
                      )}
                      {q.companies.length === 0 && (
                        <span className="faint">-</span>
                      )}
                    </div>
                  </td>
                  <td className="col-remark">
                    {q.remark ? (
                      <span className="remark">{q.remark}</span>
                    ) : null}
                  </td>
                  <td className="col-links">
                    <a
                      className="pill-link"
                      href={q.link ?? q.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${q.link ? "Practice" : "Search LeetCode for"} ${q.title} (opens in a new tab)`}
                    >
                      {q.link ? "Practice" : "LeetCode"}{" "}
                      <Icon name="external" size={11} />
                    </a>
                    <a
                      className="pill-link"
                      href={q.gfg}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Search GFG for ${q.title} (opens in a new tab)`}
                    >
                      GFG <Icon name="external" size={11} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="empty">
            <Icon name="search" size={28} />
            <h3>No questions match</h3>
            <p>Try another search or reset your filters.</p>
            <button
              className="btn"
              onClick={() => {
                setQuery("");
                setCompany("");
                setFilter("all");
                setSort("default");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      {confirmClear && (
        <ConfirmDialog
          title={`Reset ${topic.name}?`}
          description={`This will clear ${doneCount} solved questions in this topic, including any hidden by your filters. This cannot be undone.`}
          confirmLabel="Reset topic"
          onConfirm={() => onSetMany(ids, false)}
          onClose={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
