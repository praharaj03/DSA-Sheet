"use client";

import { hueVar } from "@/lib/style";
import { TOPICS, countDone, pct } from "@/lib/data";
import { TopicIcon } from "@/lib/topicIcons";

type Props = {
  active: string;
  done: Set<string>;
  onNavigate: (view: string) => void;
};

export default function Sidebar({ active, done, onNavigate }: Props) {
  return (
    <nav className="sidebar" aria-label="Topics">
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
              <span className="nav-name-wrap">
                <TopicIcon slug={t.slug} size={15} className="nav-icon" />
                <span className="nav-name">{t.name}</span>
              </span>
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
