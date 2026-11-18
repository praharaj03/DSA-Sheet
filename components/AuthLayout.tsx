import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">&lt;/&gt;</span>DSA
          <span className="muted">sheet</span>
        </Link>
        <div>
          <span className="eyebrow">The practice workspace</span>
          <h1 className="title">
            Big ambitions.
            <br />
            Small, consistent
            <br />
            <span className="title-accent">steps forward.</span>
          </h1>
          <p className="subtitle">
            Your questions, your progress, and a clear path to the next
            milestone. Make yourself at home.
          </p>
        </div>
        <footer>Built for a little progress, every day.</footer>
      </section>
      <section className="auth-form" aria-label="Account access">
        {children}
      </section>
    </main>
  );
}
