"use client";

import { useState } from "react";

type Props = { onDone: () => void };

export default function UsernameSetup({ onDone }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clean = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  const submit = async () => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: clean }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onDone();
  };

  return (
    <div className="setup-overlay">
      <div className="setup-card">
        <div className="setup-emoji">👋</div>
        <h1 className="setup-title">Pick your username</h1>
        <p className="setup-sub">This shows on the leaderboard. Lowercase letters, numbers and _ only. Can't be changed later.</p>
        <div className="setup-row">
          <span className="setup-at">@</span>
          <input
            className="input setup-input"
            placeholder="your_username"
            value={value}
            maxLength={20}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
        </div>
        {clean && clean !== value.trim().toLowerCase() && (
          <p className="setup-hint muted">Will be saved as: @{clean}</p>
        )}
        {error && <p className="setup-error">{error}</p>}
        <button
          className="btn btn-primary setup-btn"
          onClick={submit}
          disabled={clean.length < 3 || loading}
        >
          {loading ? "Saving…" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
