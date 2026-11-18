"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="full-state">
      <div className="state-card">
        <span className="brand-mark">&lt;/&gt;</span>
        <h1 className="h2">Let's get you back on track.</h1>
        <p className="muted">
          Your workspace couldn't load. Try again in a moment.
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
