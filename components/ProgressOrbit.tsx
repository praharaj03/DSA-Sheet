import Icon from "./Icon";

/** A visual summary of real progress, with decorative study-path orbits. */
export default function ProgressOrbit({
  solved,
  total,
  topics,
}: {
  solved: number;
  total: number;
  topics: number;
}) {
  const percent = total ? Math.round((solved / total) * 100) : 0;
  const circumference = 2 * Math.PI * 94;

  return (
    <div className="hero-visual">
      <div className="orbit-grid" aria-hidden="true" />
      <div className="orbit-label">
        <span className="status-dot" /> YOUR POTENTIAL, IN PROGRESS
      </div>
      <div
        className="progress-orbit"
        role="progressbar"
        aria-label="Overall completion"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={solved}
      >
        <svg
          className="orbit-svg"
          viewBox="0 0 320 320"
          fill="none"
          aria-hidden="true"
        >
          <circle className="orbit-outer" cx="160" cy="160" r="151" />
          <circle
            className="orbit-guide"
            cx="160"
            cy="160"
            r="128"
            strokeDasharray="1 9"
          />
          <circle className="orbit-track" cx="160" cy="160" r="94" />
          <circle
            className="orbit-value"
            cx="160"
            cy="160"
            r="94"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - solved / Math.max(total, 1))}
            transform="rotate(-90 160 160)"
          />
          <circle className="orbit-guide" cx="160" cy="160" r="78" />
          <path
            className="orbit-cross"
            d="M160 2v12m0 292v12M2 160h12m292 0h12"
          />
        </svg>
        <div className="orbit-center">
          <span className="orbit-center-icon">
            <Icon name="spark" size={20} />
          </span>
          <strong>
            {percent}
            <span>%</span>
          </strong>
          <span className="orbit-center-label">of your next chapter</span>
          <span className="orbit-solved">
            {solved} <span>/ {total} solved</span>
          </span>
        </div>
        <span className="orbit-satellite satellite-code" aria-hidden="true">
          &lt;/&gt;
        </span>
        <span className="orbit-satellite satellite-check" aria-hidden="true">
          <Icon name="check" size={21} />
        </span>
        <span className="orbit-satellite satellite-book" aria-hidden="true">
          <Icon name="book" size={19} />
        </span>
      </div>
      <div className="orbit-float orbit-float-top">
        <span className="orbit-float-icon">
          <Icon name="grid" size={17} />
        </span>
        <span>
          <strong>{topics} study paths</strong>
          <small>One clear direction</small>
        </span>
      </div>
      <div className="orbit-float orbit-float-bottom">
        <span className="orbit-float-icon">
          <Icon name="check" size={17} />
        </span>
        <span>
          <strong>{total} possibilities</strong>
          <small>Take them one at a time</small>
        </span>
        <Icon name="arrow" size={15} />
      </div>
      <div className="orbit-caption">
        <span />
        Built one problem at a time
        <span />
      </div>
    </div>
  );
}
