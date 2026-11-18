export default function Loading({
  label = "Preparing your workspace",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-mark" aria-hidden="true">
        &lt;/&gt;
      </span>
      <p>
        {label}
        <span className="loading-dots">…</span>
      </p>
      <span className="muted">
        A little focus. A little progress. Every day.
      </span>
    </div>
  );
}
