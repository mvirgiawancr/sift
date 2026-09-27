"use client";
import Link from "next/link";
import { useDataset } from "@/components/dataset-context";
import { ThemeBar } from "@/components/charts";
import { PriorityLabel } from "@/components/ui";
import { themeStats } from "@/lib/stats";

export default function Themes() {
  const { dataset: ds, href } = useDataset();
  const stats = themeStats(ds);
  const max = Math.max(1, ...stats.map((s) => s.mentions));

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-rule pb-6">
        <h1 className="text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">Themes</h1>
        <p className="mt-2 max-w-[60ch] text-ink-2">
          What customers keep bringing up in {ds.name}, ordered by how much fixing it would help.
        </p>
      </header>

      <ol>
        {stats.map((s, i) => (
          <li key={s.theme.id} className="border-b border-rule">
            <Link href={href(`/app/themes/${s.theme.id}`)}
              className="group grid gap-4 py-7 transition-colors md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-12">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl transition-colors group-hover:text-accent">{s.theme.name}</h2>
                  <PriorityLabel p={s.theme.priority} />
                </div>
                <p className="mt-2 max-w-[62ch] leading-relaxed text-ink-2">{s.theme.summary}</p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <ThemeBar s={s} max={max} grow={i} />
                <p className="font-mono text-xs text-muted">
                  <span className="num text-ink">{s.mentions}</span> mentions ·{" "}
                  <span className="num text-ink">{s.negative}</span> negative ·{" "}
                  <span className="num text-ink">{s.positive}</span> positive
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
