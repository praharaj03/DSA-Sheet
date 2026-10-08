import React from "react";

// Professional SVG icons per topic slug
export function TopicIcon({ slug, size = 18, className = "" }: { slug: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactElement> = {
    arrays: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="4" height="18" rx="1" />
        <rect x="10" y="3" width="4" height="18" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
    strings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 7h16M4 12h10M4 17h13" />
        <path d="M18 14l3 3-3 3" />
      </svg>
    ),
    "2d-arrays": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    "searching-and-sorting": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M8 11h6M11 8v6" />
      </svg>
    ),
    backtracking: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12h15" />
        <path d="M9 6l-6 6 6 6" />
        <path d="M15 6l6 6-6 6" />
      </svg>
    ),
    "linked-list": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="9" width="5" height="6" rx="1" />
        <rect x="9.5" y="9" width="5" height="6" rx="1" />
        <rect x="17" y="9" width="5" height="6" rx="1" />
        <path d="M7 12h2.5M14.5 12H17" />
        <path d="M20.5 12h1.5" strokeDasharray="2 1" />
      </svg>
    ),
    "stacks-and-queues": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="4" y="15" width="16" height="4" rx="1" />
        <rect x="4" y="10" width="16" height="4" rx="1" />
        <rect x="4" y="5" width="16" height="4" rx="1" />
        <path d="M20 3l2 2-2 2" />
      </svg>
    ),
    greedy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    "binary-trees": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="4" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="3" cy="20" r="2" />
        <circle cx="9" cy="20" r="2" />
        <path d="M12 6l-4.5 4.5M12 6l4.5 4.5M6 14l-2 4M6 14l2 4" />
      </svg>
    ),
    "binary-search-trees": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="4" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="3" cy="20" r="2" />
        <circle cx="9" cy="20" r="2" />
        <path d="M12 6l-4.5 4.5M12 6l4.5 4.5M6 14l-2 4M6 14l2 4" />
        <path d="M16 9l4 2" strokeDasharray="2 1" />
      </svg>
    ),
    "heaps-and-hashing": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 20h18" />
        <path d="M5 20V10l7-7 7 7v10" />
        <path d="M9 20v-5h6v5" />
      </svg>
    ),
    graphs: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M7 5h10M5 7v10M19 7v10M7 19h10M7 7l4 4M17 7l-4 4M7 17l4-4M17 17l-4-4" />
      </svg>
    ),
    tries: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="3" r="1.5" />
        <circle cx="6" cy="10" r="1.5" />
        <circle cx="18" cy="10" r="1.5" />
        <circle cx="3" cy="18" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
        <circle cx="21" cy="18" r="1.5" />
        <path d="M12 4.5L6 8.5M12 4.5L18 8.5M6 11.5L3 16.5M6 11.5L9 16.5M18 11.5L15 16.5M18 11.5L21 16.5" />
      </svg>
    ),
    dp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="4" height="4" rx="0.5" />
        <rect x="10" y="3" width="4" height="4" rx="0.5" />
        <rect x="17" y="3" width="4" height="4" rx="0.5" />
        <rect x="3" y="10" width="4" height="4" rx="0.5" />
        <rect x="10" y="10" width="4" height="4" rx="0.5" />
        <rect x="17" y="10" width="4" height="4" rx="0.5" />
        <rect x="3" y="17" width="4" height="4" rx="0.5" />
        <rect x="10" y="17" width="4" height="4" rx="0.5" />
        <rect x="17" y="17" width="4" height="4" rx="0.5" />
      </svg>
    ),
    "bit-manipulation": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 6h2a2 2 0 0 1 0 4H8V6zM8 10h3a2 2 0 0 1 0 4H8v-4z" />
        <path d="M15 6l3 6-3 6" />
      </svg>
    ),
    "segment-trees": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <rect x="2" y="10" width="6" height="4" rx="1" />
        <rect x="16" y="10" width="6" height="4" rx="1" />
        <rect x="2" y="18" width="5" height="4" rx="1" />
        <rect x="9" y="18" width="5" height="4" rx="1" />
        <path d="M12 6v4M5 10V8l7-2M19 10V8l-7-2M4.5 18v-4M11.5 18v-4" />
      </svg>
    ),
  };

  return icons[slug] ?? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}
