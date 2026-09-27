"use client";
import Link from "next/link";
import { useDataset } from "@/components/dataset-context";
import { SplitBar, ThemeBar, TrendChart } from "@/components/charts";
import { PriorityLabel } from "@/components/ui";
import { fmtDate, healthDelta, healthScore, sentimentCounts, sourceCounts, themeStats, weeklyTrend } from "@/lib/stats";

export default function Overview() {
  const { dataset: ds, href } = useDataset();
  const c = sentimentCounts(ds.items);
  const n = Math.max(1, ds.items.length);
  const pct = (v: number) => Math.round((v / n) * 100);
  const health = healthScore(ds.items);
  const delta = healthDelta(ds.items);
  const stats = themeStats(ds);
  const top = stats[0];
  const max = Math.max(1, ...stats.map((s) => s.mentions));
  const dates = ds.items.map((i) => i.date).sort();
  const topQuote = top && ds.items.filter((i) => i.themeId === top.theme.id).sort((a, b) => a.score - b.score)[0];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">{/feedback|reviews?$/i.test(ds.name) ? ds.name : `${ds.name} feedback`}</h1>
          <p className="mt-2 font-mono text-xs text-muted">
            {ds.items.length} responses · {sourceCounts(ds.items).length} sources · {dates.length ? `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])}` : "—"}
          </p>
        </div>
        <Link href={href("/app/feedback")} className="link text-sm">Read every response →</Link>
      </header>

      {/* the one dark beat */}
      {top && (
        <section className="mt-8 grid overflow-hidden rounded-[10px] bg-graphite text-graphite-ink md:grid-cols-[1.35fr_1fr]">
          <div className="p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-graphite-muted">Fix first</p>
            <h2 className="mt-3 text-[clamp(1.75rem,2.5vw+0.5rem,2.5rem)] !text-graphite-ink">{top.theme.name}</h2>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-graphite-ink/85">{top.theme.action}</p>
            <Link href={href(`/app/themes/${top.theme.id}`)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-graphite-ink underline decoration-accent decoration-2 underline-offset-4">
              Open theme →
            </Link>
          </div>
          <div className="flex flex-col justify-between gap-6 border-t border-graphite-rule p-6 md:border-l md:border-t-0 md:p-8">
            <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div><dt className="text-xs text-graphite-muted">MENTIONS</dt><dd className="num mt-1 text-2xl text-graphite-ink">{top.mentions}</dd></div>
              <div><dt className="text-xs text-graphite-muted">NEGATIVE</dt><dd className="num mt-1 text-2xl text-graphite-ink">{Math.round(top.negativeShare * 100)}%</dd></div>
            </dl>
            {topQuote && (
              <blockquote className="border-l-2 border-graphite-rule pl-4 text-sm leading-relaxed text-graphite-ink/80">
                “{topQuote.text}”
                <footer className="mt-1 font-mono text-xs text-graphite-muted">{topQuote.source} · {fmtDate(topQuote.date)}</footer>
              </blockquote>
            )}
          </div>
        </section>
      )}

      {/* headline numbers — one hairline strip, uneven columns */}
      <section className="mt-8 grid grid-cols-2 border-y border-rule md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <Metric label="Health score" value={`${health}`} sub={delta === null ? "one week of data so far" : <span className={delta < 0 ? "text-neg" : "text-pos"}>{delta >= 0 ? "+" : "−"}{Math.abs(delta)} vs last week</span>} />
        <Metric label="Negative" value={`${pct(c.negative)}%`} sub={`${c.negative} of ${ds.items.length}`} />
        <Metric label="Themes" value={`${ds.themes.length}`} sub={`${stats.filter((s) => s.theme.priority === "high").length} high priority`} />
        <Metric label="Positive" value={`${pct(c.positive)}%`} sub={`${c.positive} of ${ds.items.length}`} />
      </section>

      <section className="mt-10 grid gap-10 lg:grid-cols-[1.9fr_1fr]">
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl">Health over time</h2>
            <span className="font-mono text-xs text-muted">weekly · 0–100</span>
          </div>
          {weeklyTrend(ds.items).length > 1 ? (
            <TrendChart data={weeklyTrend(ds.items)} />
          ) : (
            <div className="grid h-[180px] place-items-center rounded-[10px] border border-dashed border-rule-2 px-6 text-center text-sm text-muted">
              All responses fall in one week. Import a CSV with a date column to see how health changes over time.
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-4 text-xl">Sentiment split</h2>
          <SplitBar pos={c.positive} neu={c.neutral} neg={c.negative} className="h-3" grow={0} />
          <dl className="mt-5 space-y-3 text-sm">
            {([["Negative", c.negative, "var(--color-neg)"], ["Neutral", c.neutral, "var(--color-neu)"], ["Positive", c.positive, "var(--color-pos)"]] as const).map(([l, v, col]) => (
              <div key={l} className="flex items-center justify-between border-b border-rule pb-3">
                <dt className="flex items-center gap-2"><i className="h-2 w-2 rounded-[2px]" style={{ background: col }} />{l}</dt>
                <dd className="num font-mono text-ink">{v} <span className="text-muted">· {pct(v)}%</span></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl">Themes, ranked by impact</h2>
          <Link href={href("/app/themes")} className="link text-sm">All themes →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="label py-2 font-normal">Theme</th>
                <th className="label w-[34%] py-2 font-normal">Split</th>
                <th className="label py-2 text-right font-normal">Mentions</th>
                <th className="label py-2 text-right font-normal">Negative</th>
                <th className="label py-2 text-right font-normal">Priority</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={s.theme.id} className="group border-b border-rule transition-colors hover:bg-paper-2">
                  <td className="py-3 pr-4">
                    <Link href={href(`/app/themes/${s.theme.id}`)} className="font-medium text-ink group-hover:text-accent">{s.theme.name}</Link>
                  </td>
                  <td className="py-3 pr-6"><ThemeBar s={s} max={max} grow={i} /></td>
                  <td className="num py-3 text-right font-mono text-ink">{s.mentions}</td>
                  <td className="num py-3 text-right font-mono text-ink-2">{Math.round(s.negativeShare * 100)}%</td>
                  <td className="py-3 text-right"><PriorityLabel p={s.theme.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: React.ReactNode }) {
  return (
    <div className="border-rule px-0 py-5 odd:pr-4 md:border-l md:px-5 md:first:border-l-0 md:first:pl-0">
      <p className="label">{label}</p>
      <p className="num mt-2 font-display text-[2.5rem] font-medium leading-none tracking-[-0.03em] text-ink">{value}</p>
      <p className="mt-2 text-sm text-muted">{sub}</p>
    </div>
  );
}
