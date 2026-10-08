import { TOPICS, ALL_QUESTIONS } from "./data";
import { COMPANY_STATS } from "./data";

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string; // tailwind-like hex
};

export const BADGES: Badge[] = [
  // ── Solved count milestones ──────────────────────────────────────────────
  { id: "first_blood",   emoji: "🩸", label: "First Blood",    description: "Solved your first question",      color: "#e74c3c" },
  { id: "getting_warm",  emoji: "🔥", label: "Getting Warm",   description: "Solved 25 questions",             color: "#e67e22" },
  { id: "on_fire",       emoji: "🚀", label: "On Fire",        description: "Solved 75 questions",             color: "#f39c12" },
  { id: "century",       emoji: "💯", label: "Century",        description: "Solved 100 questions",            color: "#2ecc71" },
  { id: "double",        emoji: "⚡", label: "Double Century", description: "Solved 200 questions",            color: "#3498db" },
  { id: "legend",        emoji: "👑", label: "Legend",         description: "Solved all 375 questions",        color: "#9b59b6" },

  // ── Topic milestones ─────────────────────────────────────────────────────
  { id: "topic_1",       emoji: "📚", label: "Topic Master I",   description: "Completed 1 topic",             color: "#1abc9c" },
  { id: "topic_5",       emoji: "🎓", label: "Topic Master V",   description: "Completed 5 topics",            color: "#16a085" },
  { id: "topic_all",     emoji: "🏆", label: "All Topics",       description: "Completed all 16 topics",       color: "#d4ac0d" },

  // ── Company badges ───────────────────────────────────────────────────────
  { id: "faang_ready",   emoji: "🍎", label: "FAANG Ready",    description: "Solved all FAANG-tagged questions", color: "#e74c3c" },
  { id: "google_slayer", emoji: "🔍", label: "Google Slayer",  description: "Solved all Google questions",      color: "#4285f4" },
  { id: "amazon_hunter", emoji: "📦", label: "Amazon Hunter",  description: "Solved all Amazon questions",      color: "#ff9900" },
  { id: "microsoft_pro", emoji: "🪟", label: "Microsoft Pro",  description: "Solved all Microsoft questions",   color: "#00a4ef" },

  // ── Special ──────────────────────────────────────────────────────────────
  { id: "early_bird",    emoji: "🐦", label: "Early Bird",     description: "One of the first 10 users",        color: "#f1c40f" },
  { id: "half_way",      emoji: "🎯", label: "Half Way",       description: "Solved exactly 50% of the sheet",  color: "#2cbb5d" },
];

export const BADGE_MAP = new Map(BADGES.map((b) => [b.id, b]));

export type ComputedStats = {
  totalSolved: number;
  topicsDone: number;
  companiesDone: string[];
  badges: string[];
  score: number;
};

export function computeStats(doneSet: Set<string>): ComputedStats {
  const totalSolved = doneSet.size;

  // topics fully completed
  const topicsDone = TOPICS.filter((t) =>
    t.questions.every((q) => doneSet.has(q.id))
  ).length;

  // companies where every tagged question is solved
  const companiesDone = COMPANY_STATS
    .filter(({ ids }) => ids.length > 0 && ids.every((id) => doneSet.has(id)))
    .map(({ company }) => company.name);

  // badge computation
  const badges: string[] = [];
  const total = ALL_QUESTIONS.length;

  if (totalSolved >= 1)   badges.push("first_blood");
  if (totalSolved >= 25)  badges.push("getting_warm");
  if (totalSolved >= 75)  badges.push("on_fire");
  if (totalSolved >= 100) badges.push("century");
  if (totalSolved >= 200) badges.push("double");
  if (totalSolved >= total) badges.push("legend");

  if (totalSolved >= Math.floor(total / 2) && totalSolved <= Math.ceil(total / 2) + 5)
    badges.push("half_way");

  if (topicsDone >= 1)  badges.push("topic_1");
  if (topicsDone >= 5)  badges.push("topic_5");
  if (topicsDone >= 16) badges.push("topic_all");

  const faangCompanies = ["Google", "Amazon", "Microsoft", "Facebook", "Apple"];
  const faangQuestions = ALL_QUESTIONS.filter((q) =>
    q.companies.some((c) => faangCompanies.includes(c.name))
  );
  if (faangQuestions.length > 0 && faangQuestions.every((q) => doneSet.has(q.id)))
    badges.push("faang_ready");

  const checkCompany = (name: string, badgeId: string) => {
    const qs = ALL_QUESTIONS.filter((q) => q.companies.some((c) => c.name === name));
    if (qs.length > 0 && qs.every((q) => doneSet.has(q.id))) badges.push(badgeId);
  };
  checkCompany("Google",    "google_slayer");
  checkCompany("Amazon",    "amazon_hunter");
  checkCompany("Microsoft", "microsoft_pro");

  // score: 1pt per question + 10pt per topic + 5pt per company mastered
  const score = totalSolved + topicsDone * 10 + companiesDone.length * 5;

  return { totalSolved, topicsDone, companiesDone, badges, score };
}
