"use client";

import Icon from "./Icon";
export default function Pricing({ onPractice }: { onPractice: () => void }) {
  return (
    <div className="membership-wrap">
      <header>
        <span className="eyebrow">More focus. Fewer barriers.</span>
        <h1 className="title">
          A better practice routine.
          <br />
          <span className="title-accent">Already yours.</span>
        </h1>
        <p className="subtitle">
          Everything you need to work through the sheet is included in your free
          account.
        </p>
      </header>
      <section className="membership-card">
        <div className="membership-plan">
          <span className="plan-label">
            <Icon name="spark" />
            Your membership
          </span>
          <h2>Practice, without limits.</h2>
          <div className="membership-price">
            Free<span>for every learner</span>
          </div>
          <p className="muted">Make progress at your own pace.</p>
          <button className="btn btn-primary" onClick={onPractice}>
            Back to your workspace
            <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="membership-features">
          {[
            "The complete DSA question sheet",
            "Progress synced across your devices",
            "Search by topic, problem, or company",
            "A personal activity calendar and streaks",
            "Achievement badges and community rankings",
            "Download your progress as a CSV",
          ].map((feature) => (
            <div key={feature}>
              <span className="feature-check">
                <Icon name="check" size={15} />
              </span>
              {feature}
            </div>
          ))}
        </div>
      </section>
      <div className="membership-note">
        <Icon name="book" size={22} />
        <div>
          <h3>Good preparation is a habit.</h3>
          <p className="muted">
            Choose a topic, solve a problem, and come back tomorrow. Your
            workspace will be right here.
          </p>
        </div>
      </div>
    </div>
  );
}
