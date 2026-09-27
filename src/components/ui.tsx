import type { Priority, Sentiment } from "@/lib/types";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.03em] text-ink ${className}`}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <rect width="18" height="18" rx="4" style={{ fill: "var(--color-accent)" }} />
        <path d="M4.5 6h9M6 9h6M7.5 12h3" strokeWidth="1.6" strokeLinecap="round" style={{ stroke: "var(--color-accent-ink)" }} />
      </svg>
      Sift
    </span>
  );
}

const S_COLOR: Record<Sentiment, string> = {
  positive: "var(--color-pos)",
  neutral: "var(--color-neu)",
  negative: "var(--color-neg)",
};

/** Sentiment is never colour-only: a shaped marker plus the word. */
export function SentimentLabel({ s }: { s: Sentiment }) {
  const mark = s === "positive" ? "+" : s === "negative" ? "−" : "·";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-2">
      <span className="grid h-4 w-4 place-items-center rounded-[3px] text-[11px] leading-none text-accent-ink" style={{ background: S_COLOR[s] }}>
        {mark}
      </span>
      {s}
    </span>
  );
}

const P_CLASS: Record<Priority, string> = {
  high: "text-neg border-neg/40",
  medium: "text-ink-2 border-rule-2",
  low: "text-muted border-rule",
};

export function PriorityLabel({ p }: { p: Priority }) {
  return <span className={`inline-block whitespace-nowrap rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] ${P_CLASS[p]}`}>{p}</span>;
}

export { S_COLOR };
