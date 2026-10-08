"use client";

import { useState } from "react";

type Plan = {
  id: "free" | "pro" | "elite";
  name: string;
  price: string;
  period: string;
  tagline: string;
  color: string;
  glow: string;
  badge?: string;
  features: { text: string; included: boolean }[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Everything you need to get started",
    color: "#9a9aa5",
    glow: "rgba(154,154,165,0.08)",
    features: [
      { text: "375 DSA questions", included: true },
      { text: "Progress tracking", included: true },
      { text: "Company tags & logos", included: true },
      { text: "Leaderboard access", included: true },
      { text: "Streak calendar", included: true },
      { text: "15 achievement badges", included: true },
      { text: "Company matcher", included: true },
      { text: "AI hint system", included: false },
      { text: "Custom question lists", included: false },
      { text: "Interview scheduler", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹199",
    period: "per month",
    tagline: "For serious interview prep",
    color: "#2cbb5d",
    glow: "rgba(44,187,93,0.10)",
    badge: "Most Popular",
    features: [
      { text: "Everything in Free", included: true },
      { text: "AI hint system", included: true },
      { text: "Custom question lists", included: true },
      { text: "Detailed analytics", included: true },
      { text: "Export progress as PDF", included: true },
      { text: "Company-wise mock tests", included: true },
      { text: "Interview scheduler", included: false },
      { text: "1-on-1 mentorship", included: false },
      { text: "Resume review", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: "₹499",
    period: "per month",
    tagline: "Land your dream offer",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.10)",
    badge: "Best Value",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Interview scheduler", included: true },
      { text: "1-on-1 mentorship sessions", included: true },
      { text: "Resume review", included: true },
      { text: "Mock interview recordings", included: true },
      { text: "Referral network access", included: true },
      { text: "Placement guarantee support", included: true },
      { text: "Priority support 24/7", included: true },
      { text: "Early access to new features", included: true },
      { text: "Private Discord community", included: true },
    ],
  },
];

export default function Pricing() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "elite">("pro");

  const handleUpgrade = (plan: "pro" | "elite") => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <div className="pricing-wrap">
      <div className="pricing-head">
        <div className="pricing-eyebrow">Pricing</div>
        <h1 className="title">Simple, transparent pricing</h1>
        <p className="subtitle">
          Start free. Upgrade when you're ready to go all in on your interview prep.
        </p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.id === "pro" ? "plan-featured" : ""}`}
            style={{ "--plan-color": plan.color, "--plan-glow": plan.glow } as React.CSSProperties}
          >
            {plan.badge && (
              <div className="plan-badge" style={{ background: plan.color, color: plan.id === "pro" ? "#000" : "#fff" }}>
                {plan.badge}
              </div>
            )}

            <div className="plan-top">
              <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
              <div className="plan-price-row">
                <span className="plan-price">{plan.price}</span>
                <span className="plan-period muted">/{plan.period}</span>
              </div>
              <p className="plan-tagline muted">{plan.tagline}</p>
            </div>

            <div className="plan-divider" />

            <ul className="plan-features">
              {plan.features.map((f) => (
                <li key={f.text} className={`plan-feature ${f.included ? "" : "plan-feature-off"}`}>
                  <span className="plan-feature-icon">
                    {f.included
                      ? <CheckIcon color={plan.color} />
                      : <CrossIcon />}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <div className="plan-action">
              {plan.id === "free" ? (
                <button className="btn plan-btn-free" disabled>
                  Current Plan
                </button>
              ) : (
                <button
                  className="btn plan-btn-paid"
                  style={{ background: plan.color, borderColor: plan.color, color: plan.id === "pro" ? "#000" : "#fff" }}
                  onClick={() => handleUpgrade(plan.id as "pro" | "elite")}
                >
                  Upgrade to {plan.name} →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <div className="pricing-trust">
          <TrustItem icon="🔒" text="Secure payments via Razorpay" />
          <TrustItem icon="↩️" text="7-day money back guarantee" />
          <TrustItem icon="⚡" text="Cancel anytime, no questions" />
        </div>
      </div>

      {showModal && (
        <ComingSoonModal plan={selectedPlan} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function TrustItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="trust-item">
      <span>{icon}</span>
      <span className="muted" style={{ fontSize: 13 }}>{text}</span>
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
      <path d="M4.5 8l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.04)" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#5b5b66" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ComingSoonModal({ plan, onClose }: { plan: "pro" | "elite"; onClose: () => void }) {
  const p = PLANS.find((x) => x.id === plan)!;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}
        style={{ "--plan-color": p.color } as React.CSSProperties}>
        <div className="modal-glow" style={{ background: p.glow }} />
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="modal-icon">🚀</div>
        <h2 className="modal-title">Coming Soon</h2>
        <p className="modal-sub">
          <span style={{ color: p.color, fontWeight: 700 }}>{p.name} plan</span> is under construction.
          We're building something great — payments, AI hints, and more.
        </p>
        <div className="modal-eta">
          <span className="modal-eta-dot" style={{ background: p.color }} />
          Expected launch: <strong>Q3 2025</strong>
        </div>
        <button className="btn btn-primary modal-notify-btn" onClick={onClose}>
          Got it, notify me when ready
        </button>
        <p className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 8 }}>
          We'll email you when {p.name} goes live.
        </p>
      </div>
    </div>
  );
}
