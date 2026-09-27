import type { Dataset, FeedbackItem, Sentiment, Theme } from "./types";

export interface ThemeStat {
  theme: Theme;
  mentions: number;
  positive: number;
  neutral: number;
  negative: number;
  negativeShare: number;
  avgScore: number;
  /** mentions weighted by how negative they are — what to fix first */
  impact: number;
}

export interface WeekPoint {
  week: string; // ISO date of the week's Monday
  count: number;
  avgScore: number;
}

export function sentimentCounts(items: FeedbackItem[]) {
  const c: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  for (const i of items) c[i.sentiment]++;
  return c;
}

/** Net sentiment on a 0–100 scale (50 = neutral). */
export function healthScore(items: FeedbackItem[]) {
  if (!items.length) return 50;
  const avg = items.reduce((s, i) => s + i.score, 0) / items.length;
  return Math.round((avg + 1) * 50);
}

export function themeStats(ds: Dataset): ThemeStat[] {
  return ds.themes
    .map((theme) => {
      const its = ds.items.filter((i) => i.themeId === theme.id);
      const c = sentimentCounts(its);
      const avgScore = its.length ? its.reduce((s, i) => s + i.score, 0) / its.length : 0;
      return {
        theme,
        mentions: its.length,
        ...c,
        negativeShare: its.length ? c.negative / its.length : 0,
        avgScore,
        impact: its.reduce((s, i) => s + Math.max(0, -i.score), 0),
      };
    })
    .sort((a, b) => b.impact - a.impact || b.mentions - a.mentions);
}

function mondayOf(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export function weeklyTrend(items: FeedbackItem[]): WeekPoint[] {
  const by = new Map<string, FeedbackItem[]>();
  for (const i of items) {
    const w = mondayOf(i.date);
    by.set(w, [...(by.get(w) ?? []), i]);
  }
  return [...by.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, its]) => ({
      week,
      count: its.length,
      avgScore: its.reduce((s, i) => s + i.score, 0) / its.length,
    }));
}

export function sourceCounts(items: FeedbackItem[]) {
  const m = new Map<string, number>();
  for (const i of items) m.set(i.source, (m.get(i.source) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Health change between the last two weeks, in points — null when there is only one week of data. */
export function healthDelta(items: FeedbackItem[]): number | null {
  const t = weeklyTrend(items);
  if (t.length < 2) return null;
  const a = t[t.length - 2].avgScore, b = t[t.length - 1].avgScore;
  return Math.round((b - a) * 50);
}

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
