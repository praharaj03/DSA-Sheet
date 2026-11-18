"use client";

import { hueVar } from "@/lib/style";
import { TOPICS, TOTAL, countDone, pct } from "@/lib/data";
import { TopicIcon } from "@/lib/topicIcons";
import Icon from "./Icon";

type Props = {
  active: string;
  done: Set<string>;
  onNavigate: (view: string) => void;
};
export default function Sidebar({ active, done, onNavigate }: Props) {
  const completed = TOPICS.filter((topic) =>
    topic.questions.every((question) => done.has(question.id)),
  ).length;
  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <span className="eyebrow">Your study path</span>
        <span className="sidebar-count">{TOPICS.length}</span>
      </div>
      <nav className="topic-nav" aria-label="Topics">
        {TOPICS.map((topic, index) => {
          const solved = countDone(
            topic.questions.map((q) => q.id),
            done,
          );
          const percent = pct(solved, topic.questions.length);
          return (
            <button
              key={topic.slug}
              className={`nav-item ${active === topic.slug ? "active" : ""}`}
              style={hueVar(topic.hue)}
              onClick={() => onNavigate(topic.slug)}
              aria-current={active === topic.slug ? "page" : undefined}
            >
              <span className="nav-row">
                <span className="nav-name-wrap">
                  <span className="nav-topic-icon">
                    <TopicIcon slug={topic.slug} size={16} />
                  </span>
                  <span className="nav-name">{topic.name}</span>
                </span>
                <span className="nav-pct">
                  {percent === 100 ? (
                    <Icon name="check" size={14} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
              </span>
              <span className="nav-bar">
                <span
                  className="nav-bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-note">
        <span className="sidebar-note-icon">
          <Icon name="spark" size={18} />
        </span>
        <strong>Consistency compounds.</strong>
        <p>
          {completed
            ? `${completed} topics mastered. Keep your momentum.`
            : "One problem today is one step closer."}
        </p>
        <div className="bar bar-thin">
          <div
            className="bar-fill"
            style={{ width: `${pct(done.size, TOTAL)}%` }}
          />
        </div>
        <span className="faint">
          {done.size} of {TOTAL} questions solved
        </span>
      </div>
    </aside>
  );
}
