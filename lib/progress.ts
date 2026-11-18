import { validQuestionIds } from "./data";

export type ProgressData = {
  done: string[];
  revision: number;
  activityLog: Record<string, number>;
  currentStreak: number;
  maxStreak: number;
};
export type Change = { value: boolean };
export type PendingChanges = Record<string, Change>;

export function applyChanges(ids: string[], changes: PendingChanges) {
  const done = new Set(validQuestionIds(ids));
  for (const id of validQuestionIds(Object.keys(changes))) {
    if (changes[id].value) done.add(id);
    else done.delete(id);
  }
  return [...done];
}

export function parseCache(
  raw: string | null,
): { done: string[]; pending: PendingChanges } | null {
  try {
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      !data ||
      !Array.isArray(data.done) ||
      !data.pending ||
      typeof data.pending !== "object"
    )
      return null;
    const pending: PendingChanges = {};
    for (const id of validQuestionIds(Object.keys(data.pending))) {
      if (typeof data.pending[id]?.value === "boolean")
        pending[id] = { value: data.pending[id].value };
    }
    return { done: validQuestionIds(data.done), pending };
  } catch {
    return null;
  }
}
