"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDataset } from "@/components/dataset-context";
import { SplitBar, TrendChart } from "@/components/charts";
import { PriorityLabel, SentimentLabel } from "@/components/ui";
import { fmtDate, themeStats, weeklyTrend } from "@/lib/stats";

export default function ThemeDetail() {
  const { id } = useParams<{ id: string }>();
  const { dataset: ds, href } = useDataset();
  const all = themeStats(ds);
  const rank = all.findIndex((t) => t.theme.id === id);
  const s = all[rank];

  if (!s) {
    return (
      <div className="mx-auto max-w-xl py-24">
        <h1 className="text-3xl">This theme isn’t in {ds.name}</h1>
        <p className="mt-3 text-ink-2">It may belong to another dataset. Pick one from the sidebar, or go back to the list.</p>
        <Link href={href("/app/themes")} className="link mt-6 inline-block text-sm">Back to themes →</Link>
      </div>
    );
  }

  const items = ds.items.filter((i) => i.themeId === id).sort((a, b) => b.date.localeCompare(a.date));
  const share = Math.round((s.mentions / Math.max(1, ds.items.length)) * 100);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href={href("/app/themes")} className="link text-sm text-neutral">← Themes</Link>

      <header className="mt-4 grid gap-6 border-b border-rule pb-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">{s.theme.name}</h1>
            <PriorityLabel p={s.theme.priority} />
          </div>
          <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-2">{s.theme.summary}</p>
        </div>
        <dl className="grid grid-cols-3 content-end gap-4 font-mono">
          <div><dt className="label">Rank</dt><dd className="num mt-1 text-2xl text-ink">#{rank + 1}</dd></div>
          <div><dt className="label">Mentions</dt><dd className="num mt-1 text-2xl text-ink">{s.mentions}</dd></div>
          <div><dt className="label">Share</dt><dd className="num mt-1 text-2xl text-ink">{share}%</dd></div>
          <div className="col-span-3">
            <SplitBar pos={s.positive} neu={s.neutral} neg={s.negative} className="h-2" />
            <p className="mt-2 text-xs text-muted">{s.negative} negative · {s.neutral} neutral · {s.positive} positive</p>
          </div>
        </dl>
      </header>

      <section className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div>
          <h2 className="text-xl">Recommended action</h2>
          <p className="mt-3 border-l-2 border-accent pl-4 text-lg leading-relaxed text-ink">{s.theme.action}</p>
        </div>
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl">Health for this theme</h2>
            <span className="font-mono text-xs text-muted">weekly · 0–100</span>
          </div>
          {weeklyTrend(items).length > 1 ? <TrendChart data={weeklyTrend(items)} height={200} /> : <p className="text-sm text-muted">Needs feedback from at least two different weeks to draw a trend.</p>}
        </div>
      </section>

      <section>
        <h2 className="border-b border-rule pb-3 text-xl">In their words <span className="num font-mono text-sm text-muted">· {items.length}</span></h2>
        <ul>
          {items.map((i) => (
            <li key={i.id} className="grid gap-2 border-b border-rule py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8">
              <p className="leading-relaxed text-ink">“{i.text}”</p>
              <div className="flex items-center gap-4 font-mono text-xs text-muted">
                <SentimentLabel s={i.sentiment} />
                <span className="w-20">{i.source}</span>
                <span className="w-12 text-right">{fmtDate(i.date)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
