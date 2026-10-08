import { SHEET } from "../data/sheet";
import { parseCompanies, type Company } from "./companies";

export type Question = {
  id: string;
  n: number;
  title: string;
  companies: Company[];
  remark?: string;
  link?: string;
  leetcode: string;
  gfg: string;
};

export type Topic = {
  name: string;
  slug: string;
  hue: number;
  questions: Question[];
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const TOPICS: Topic[] = SHEET.map((t, ti) => ({
  name: t.name,
  slug: slugify(t.name),
  hue: Math.round((205 + ti * (360 / SHEET.length)) % 360),
  questions: t.rows.map((row, qi) => {
    const title = row.title;
    const q = encodeURIComponent(title);
    return {
      id: `${ti}-${qi}`,
      n: qi + 1,
      title,
      companies: Array.isArray(row.companies)
        ? parseCompanies(row.companies.join(" "))
        : parseCompanies(row.companies ?? ""),
      remark: row.remark,
      link: row.link,
      leetcode: row.link ?? `https://leetcode.com/problemset/?search=${q}`,
      gfg: `https://www.google.com/search?q=${q}+site%3Ageeksforgeeks.org`,
    };
  }),
}));

export const ALL_QUESTIONS: (Question & { topic: Topic })[] = TOPICS.flatMap((t) =>
  t.questions.map((q) => ({ ...q, topic: t }))
);

export const TOTAL = ALL_QUESTIONS.length;

export type CompanyStat = { company: Company; ids: string[] };

/** Companies ranked by how many sheet questions they appear in. */
export const COMPANY_STATS: CompanyStat[] = (() => {
  const m = new Map<string, CompanyStat>();
  for (const q of ALL_QUESTIONS) {
    for (const c of q.companies) {
      const s = m.get(c.name) ?? { company: c, ids: [] };
      s.ids.push(q.id);
      m.set(c.name, s);
    }
  }
  return Array.from(m.values()).sort((a, b) => b.ids.length - a.ids.length);
})();

export const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

export const countDone = (ids: string[], done: Set<string>) => ids.reduce((n, id) => n + (done.has(id) ? 1 : 0), 0);
