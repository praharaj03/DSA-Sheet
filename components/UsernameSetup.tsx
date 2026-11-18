"use client";

import { useState, type FormEvent } from "react";
import { fetchJSON } from "@/lib/client";
import { normalizeUsername } from "@/lib/profile";
import Icon from "./Icon";

export default function UsernameSetup({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const username = normalizeUsername(value);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username || loading) return;
    setError("");
    setLoading(true);
    try {
      await fetchJSON("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      onDone();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Couldn't save. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="full-state">
      <form className="setup-card" onSubmit={submit}>
        <span className="brand-mark">&lt;/&gt;</span>
        <span className="eyebrow">Make yourself at home</span>
        <h1 className="setup-title">Your journey starts here.</h1>
        <p className="setup-sub">
          Choose a username for your profile and the community leaderboard. You
          can update it later in your profile.
        </p>
        <label className="edit-label" htmlFor="setup-username">
          Your username
        </label>
        <div className="setup-row">
          <span className="setup-at">@</span>
          <input
            id="setup-username"
            className="input setup-input"
            placeholder="your_username"
            autoComplete="username"
            aria-describedby="username-help"
            aria-invalid={!!error}
            value={value}
            maxLength={20}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            autoFocus
          />
        </div>
        <p className="setup-hint muted" id="username-help">
          3–20 letters, numbers, or underscores.
        </p>
        {error && (
          <p className="setup-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="btn btn-primary setup-btn"
          disabled={!username || loading}
        >
          {loading ? "Creating your workspace…" : "Let's get started"}
          <Icon name="arrow" size={17} />
        </button>
        <span className="setup-hint muted">
          Your progress. Your pace. All in one place.
        </span>
      </form>
    </main>
  );
}
