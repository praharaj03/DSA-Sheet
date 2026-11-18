/** Activity dates use UTC consistently across devices and daylight-saving changes. */
export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function computeStreaks(
  log: Map<string, number> | Record<string, number>,
  now = new Date(),
) {
  const entries = log instanceof Map ? [...log.entries()] : Object.entries(log);
  const today = toDateKey(now);
  const sorted = entries
    .filter(
      ([day, count]) =>
        count > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(day) &&
        Number.isFinite(Date.parse(day)) &&
        toDateKey(new Date(day)) === day &&
        day <= today,
    )
    .map(([day]) => day)
    .sort();
  const days = new Set(sorted);
  let maxStreak = 0;
  let run = 0;
  let previous = 0;
  for (const day of sorted) {
    const timestamp = Date.parse(day);
    run = timestamp - previous === 86400000 ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    previous = timestamp;
  }
  let cursor = Date.parse(today);
  if (!days.has(today)) cursor -= 86400000;
  let currentStreak = 0;
  while (days.has(toDateKey(new Date(cursor)))) {
    currentStreak++;
    cursor -= 86400000;
  }
  return { currentStreak, maxStreak };
}
