export function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function computeStreaks(log: Map<string, number> | Record<string, number>) {
  const entries = log instanceof Map ? Array.from(log.keys()) : Object.keys(log);
  if (entries.length === 0) return { currentStreak: 0, maxStreak: 0 };

  const days = new Set(entries);
  const sorted = Array.from(days).sort();

  let maxStreak = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 1;
  }

  // current streak: count backwards from today
  const today = toDateKey(new Date());
  let currentStreak = 0;
  let check = new Date();
  while (true) {
    const key = toDateKey(check);
    if (!days.has(key)) {
      // allow missing today (streak still alive if yesterday exists)
      if (key === today) { check.setDate(check.getDate() - 1); continue; }
      break;
    }
    currentStreak++;
    check.setDate(check.getDate() - 1);
  }

  return { currentStreak, maxStreak };
}
