"use client";
import { useState } from "react";
import { useDataset } from "@/components/dataset-context";
import { SentimentLabel } from "@/components/ui";
import { fmtDate } from "@/lib/stats";
import type { Sentiment } from "@/lib/types";

const SENT: (Sentiment | "all")[] = ["all", "negative", "neutral", "positive"];

export default function Feedback() {
  const { dataset: ds } = useDataset();
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<Sentiment | "all">("all");
  const [theme, setTheme] = useState("all");
  const themeName = new Map(ds.themes.map((t) => [t.id, t.name]));

  const items = ds.items
    .filter((i) => sent === "all" || i.sentiment === sent)
    .filter((i) => theme === "all" || i.themeId === theme)
    .filter((i) => !q || i.text.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const control = "rounded-[6px] border border-rule-2 bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors hover:border-neutral focus-visible:border-accent";

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-rule pb-6">
        <h1 className="text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">All feedback</h1>
        <p className="mt-2 font-mono text-xs text-muted">
          Showing <span className="num text-ink">{items.length}</span> of {ds.items.length}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-rule py-4">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the text…" aria-label="Search feedback"
          className={`${control} min-w-0 flex-1 basis-56`} />
        <div role="radiogroup" aria-label="Sentiment" className="flex rounded-[6px] border border-rule-2 p-0.5">
          {SENT.map((s) => (
            <button key={s} role="radio" aria-checked={sent === s} onClick={() => setSent(s)}
              className={`rounded-[4px] px-2.5 py-1.5 font-mono text-xs capitalize transition-colors ${sent === s ? "bg-ink text-paper" : "text-neutral hover:text-ink"}`}>
              {s}
            </button>
          ))}
        </div>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} aria-label="Theme" className={control}>
          <option value="all">Every theme</option>
          {ds.themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="py-16">
          <p className="text-ink">No feedback matches these filters.</p>
          <button onClick={() => { setQ(""); setSent("all"); setTheme("all"); }} className="link mt-2 text-sm">Clear filters</button>
        </div>
      ) : (
        <ul>
          {items.map((i) => (
            <li key={i.id} className="grid gap-2 border-b border-rule py-4 md:grid-cols-[minmax(0,1fr)_11rem_7rem_5.5rem_3.5rem] md:items-center md:gap-6">
              <p className="leading-relaxed text-ink">{i.text}</p>
              <span className="truncate text-sm text-ink-2">{themeName.get(i.themeId) ?? "Other"}</span>
              <SentimentLabel s={i.sentiment} />
              <span className="font-mono text-xs text-muted">{i.source}</span>
              <span className="font-mono text-xs text-muted md:text-right">{fmtDate(i.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
