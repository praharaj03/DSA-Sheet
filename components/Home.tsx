"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { hueVar } from "@/lib/style";
import {
  ALL_QUESTIONS,
  COMPANY_STATS,
  TOPICS,
  TOTAL,
  countDone,
  pct,
} from "@/lib/data";
import { TopicIcon } from "@/lib/topicIcons";
import CompanyLogo from "./CompanyLogo";
import ConfirmDialog from "./ConfirmDialog";
import Icon from "./Icon";

type Props = {
  done: Set<string>;
  ready: boolean;
  onOpen: (slug: string) => void;
  onReset: () => void;
};

export default function Home({ done, onOpen, onReset }: Props) {
  const [query, setQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const topicStats = TOPICS.map((topic) => {
    const solved = countDone(
      topic.questions.map((q) => q.id),
      done,
    );
    return {
      topic,
      solved,
      total: topic.questions.length,
      percent: pct(solved, topic.questions.length),
    };
  });
  const totalDone = topicStats.reduce((sum, stat) => sum + stat.solved, 0);
  const overall = pct(totalDone, TOTAL);
  const topicsFinished = topicStats.filter(
    (stat) => stat.solved === stat.total,
  ).length;
  const nextTopic =
    topicStats.find((stat) => stat.solved > 0 && stat.solved < stat.total) ??
    topicStats.find((stat) => stat.solved < stat.total);
  const nextQuestion = nextTopic?.topic.questions.find(
    (question) => !done.has(question.id),
  );
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? ALL_QUESTIONS.filter((question) =>
        `${question.title} ${question.topic.name} ${question.companies.map((company) => company.name).join(" ")}`
          .toLowerCase()
          .includes(normalized),
      )
    : [];

  const exportProgress = () => {
    const csv = [
      "Topic,Question,Status",
      ...ALL_QUESTIONS.map((question) =>
        [
          question.topic.name,
          question.title,
          done.has(question.id) ? "Solved" : "Pending",
        ]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "dsa-sheet-progress.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Your progress export is ready");
  };

  return (
    <div className="home">
      <header className="home-head">
        <div>
          <span className="eyebrow">A little better, every day</span>
          <h1 className="title">
            Your next chapter
            <br />
            starts with <span className="title-accent">one problem.</span>
          </h1>
          <p className="subtitle">
            A clear path through {TOTAL} questions. Build your skills,
            <br className="desktop-break" /> find your rhythm, and make every
            session count.
          </p>
        </div>
        <button className="btn export-btn" onClick={exportProgress}>
          <Icon name="download" size={16} />
          Export progress
        </button>
      </header>

      <section className="stats" aria-label="Overall stats">
        {[
          {
            value: `${overall}%`,
            label: "Sheet completed",
            icon: "grid" as const,
            note: "Your progress, at a glance",
          },
          {
            value: totalDone,
            label: "Problems solved",
            icon: "check" as const,
            note: `${TOTAL - totalDone} opportunities ahead`,
          },
          {
            value: `${topicsFinished}`,
            label: "Topics mastered",
            icon: "book" as const,
            note: `Across ${TOPICS.length} core topics`,
          },
          {
            value: TOTAL - totalDone,
            label: "Up next",
            icon: "arrow" as const,
            note: "One step at a time",
          },
        ].map((stat) => (
          <div className="stat" key={stat.label}>
            <div className="stat-top">
              <span className="stat-label">{stat.label}</span>
              <Icon name={stat.icon} size={16} />
            </div>
            <span className="stat-value">
              {stat.value}
              {stat.label === "Topics mastered" && (
                <span className="stat-of"> / {TOPICS.length}</span>
              )}
            </span>
            <span className="stat-note">{stat.note}</span>
          </div>
        ))}
      </section>

      <section className="continue-card" aria-label="Continue practicing">
        <div className="continue-art" aria-hidden="true">
          <span>{"{ }"}</span>
          <i />
          <i />
          <i />
        </div>
        <div className="continue-copy">
          <span className="eyebrow">
            {nextTopic
              ? totalDone
                ? "Keep the momentum"
                : "Your starting line"
              : "A milestone worth celebrating"}
          </span>
          <h2>
            {nextTopic
              ? totalDone
                ? "Pick up where you left off."
                : "Great habits start small."
              : "Every question. Every topic. Done."}
          </h2>
          <p>
            {nextQuestion ? (
              <>
                <span className="strong">{nextTopic?.topic.name}</span>
                <span className="continue-dot">·</span>
                {nextQuestion.title}
              </>
            ) : (
              "You've completed the sheet. Revisit a topic to keep your skills sharp."
            )}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onOpen(nextTopic?.topic.slug ?? TOPICS[0].slug)}
        >
          {nextTopic
            ? totalDone
              ? "Continue practicing"
              : "Start practicing"
            : "Review the sheet"}
          <Icon name="arrow" size={17} />
        </button>
      </section>

      <section aria-label="Browse topics">
        <div className="section-heading">
          <div>
            <span className="eyebrow">The study path</span>
            <h2 className="h2">Small steps. Solid foundations.</h2>
            <p className="muted">
              Work through the essentials, in your own order.
            </p>
          </div>
          <label className="search-box">
            <Icon name="search" size={17} />
            <input
              ref={search}
              type="search"
              placeholder="Find a topic, problem, company…"
              aria-label="Search all questions"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        {normalized ? (
          <div className="search-results">
            <div className="result-count" role="status">
              {results.length} {results.length === 1 ? "question" : "questions"}{" "}
              found
              <button
                className="link-btn"
                onClick={() => {
                  setQuery("");
                  search.current?.focus();
                }}
              >
                Clear search
              </button>
            </div>
            {results.slice(0, 50).map((question) => (
              <button
                className="search-result"
                key={question.id}
                onClick={() =>
                  onOpen(
                    `${question.topic.slug}?q=${encodeURIComponent(question.title)}`,
                  )
                }
              >
                <span
                  className={`result-check ${done.has(question.id) ? "is-done" : ""}`}
                >
                  <Icon
                    name={done.has(question.id) ? "check" : "book"}
                    size={16}
                  />
                </span>
                <span>
                  <strong>{question.title}</strong>
                  <small>{question.topic.name}</small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
            {results.length > 50 && (
              <p className="muted result-count">
                Showing the first 50. Refine your search to find more.
              </p>
            )}
            {results.length === 0 && (
              <div className="empty">
                <Icon name="search" size={28} />
                <h3>No matches just yet</h3>
                <p>Try a topic such as arrays, or a company such as Google.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="topic-grid">
            {topicStats.map(({ topic, solved, total, percent }, index) => (
              <button
                className={`topic-card ${percent === 100 ? "topic-complete" : ""}`}
                key={topic.slug}
                style={hueVar(topic.hue)}
                onClick={() => onOpen(topic.slug)}
              >
                <div className="topic-card-top">
                  <span className="topic-card-icon">
                    <TopicIcon slug={topic.slug} size={22} />
                  </span>
                  <span className="topic-number">
                    {percent === 100 ? (
                      <Icon name="check" size={17} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                </div>
                <h3>{topic.name}</h3>
                <div className="topic-card-count">
                  <span>{total} problems</span>
                  <span>
                    {solved > 0 ? `${percent}%` : "Start learning"}
                    <Icon name="arrow" size={13} />
                  </span>
                </div>
                <div
                  className="bar bar-thin"
                  role="progressbar"
                  aria-label={`${topic.name} progress`}
                  aria-valuenow={solved}
                  aria-valuemin={0}
                  aria-valuemax={total}
                >
                  <div className="bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="topic-card-bottom">
                  {solved} of {total} solved
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="progress-map" aria-label="Question completion map">
        <div className="section-heading">
          <div>
            <span className="eyebrow">See how far you've come</span>
            <h2 className="h2">Every problem leaves a mark.</h2>
          </div>
          <span className="map-legend">
            <span className="cell" />
            To explore
            <span className="cell on" />
            Solved
          </span>
        </div>
        <div className="field">
          {topicStats.map(({ topic, solved }) => (
            <div className="field-group" key={topic.slug}>
              <button
                className="field-label"
                onClick={() => onOpen(topic.slug)}
              >
                {topic.name}
                <span className="field-count">
                  {solved}/{topic.questions.length}
                </span>
              </button>
              <div
                className="cells"
                aria-label={`${topic.name}: ${solved} of ${topic.questions.length} solved`}
              >
                {topic.questions.map((question) => (
                  <span
                    key={question.id}
                    className={`cell ${done.has(question.id) ? "on" : ""}`}
                    title={`${question.title}${done.has(question.id) ? " (solved)" : ""}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Company practice coverage">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Practice with a destination</span>
            <h2 className="h2">Your company shortlist.</h2>
            <p className="muted">
              Coverage of company-tagged questions in this sheet.
            </p>
          </div>
          <button className="link-btn" onClick={() => onOpen("leaderboard")}>
            Explore your coverage <Icon name="arrow" size={15} />
          </button>
        </div>
        <ul className="company-list">
          {COMPANY_STATS.slice(0, 8).map(({ company, ids }) => {
            const solved = countDone(ids, done);
            return (
              <li className="company-row" key={company.name}>
                <CompanyLogo company={company} size={30} />
                <span className="company-name">{company.name}</span>
                <div className="bar bar-thin">
                  <div
                    className="bar-fill"
                    style={{ width: `${pct(solved, ids.length)}%` }}
                  />
                </div>
                <span className="company-count muted">
                  {solved} / {ids.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <footer className="home-foot">
        <span className="muted">
          <Icon name="cloud" size={15} />
          Progress syncs to your account, with recovery on this device.
        </span>
        <button
          className="link-btn danger"
          onClick={() => setConfirmReset(true)}
          disabled={!totalDone}
        >
          Reset progress
        </button>
      </footer>
      {confirmReset && (
        <ConfirmDialog
          title="Start with a clean sheet?"
          description={`This will clear all ${totalDone} solved questions across your topics. Your activity history will remain. This cannot be undone.`}
          confirmLabel="Reset progress"
          onConfirm={onReset}
          onClose={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
