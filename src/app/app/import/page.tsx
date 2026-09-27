"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDataset } from "@/components/dataset-context";
import { fromCsv, fromText } from "@/lib/parse";
import type { Dataset, RawFeedback } from "@/lib/types";

const MAX = 200;

export default function Import() {
  const router = useRouter();
  const { add } = useDataset();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [csv, setCsv] = useState<{ file: string; rows: RawFeedback[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/analyze").then((r) => r.json()).then((j) => setConfigured(Boolean(j.configured))).catch(() => setConfigured(false));
  }, []);

  const rows = csv ? csv.rows : fromText(text);
  const tooMany = rows.length > MAX;
  const canRun = rows.length >= 3 && !tooMany && !busy && configured !== false;

  async function onFile(f: File | undefined) {
    if (!f) return;
    setError("");
    const parsed = fromCsv(await f.text());
    if (!parsed.length) {
      setError(`Couldn’t find any feedback in ${f.name}. The first row should be a header with a “text” column.`);
      return;
    }
    setCsv({ file: f.name, rows: parsed });
    if (!name) setName(f.name.replace(/\.csv$/i, ""));
  }

  async function run() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "My feedback", items: rows }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Analysis failed.");
      const ds = j.dataset as Dataset;
      add(ds);
      router.push(`/app?d=${ds.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setBusy(false);
    }
  }

  const control = "w-full rounded-[6px] border border-rule-2 bg-paper px-3 py-2.5 text-ink outline-none transition-colors hover:border-neutral focus-visible:border-accent disabled:opacity-50";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="max-w-3xl">
      <header className="border-b border-rule pb-6">
        <h1 className="text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">Analyze feedback</h1>
        <p className="mt-2 max-w-[58ch] text-ink-2">
          Paste one response per line, or upload a CSV. Sift groups it into themes, scores each response and ranks what to fix. Up to {MAX} responses at a time.
        </p>
      </header>

      {configured === false && (
        <p role="status" className="mt-6 rounded-[6px] border border-rule-2 bg-paper-2 px-4 py-3 text-sm text-ink-2">
          AI analysis isn’t switched on for this deployment yet. You can still explore everything with the{" "}
          <Link href="/app" className="link">Bloomcart sample</Link>.
        </p>
      )}

      <div className="mt-8 space-y-6">
        <label className="block">
          <span className="text-sm font-medium text-ink">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. App Store reviews, September" maxLength={60} disabled={busy} className={`${control} mt-2`} />
        </label>

        {csv ? (
          <div className="flex items-center justify-between rounded-[6px] border border-rule-2 px-4 py-3">
            <p className="text-sm text-ink">
              <span className="font-mono">{csv.file}</span> · <span className="num">{csv.rows.length}</span> responses found
            </p>
            <button onClick={() => { setCsv(null); if (fileRef.current) fileRef.current.value = ""; }} disabled={busy} className="link text-sm">
              Remove
            </button>
          </div>
        ) : (
          <label className="block">
            <span className="flex items-baseline justify-between text-sm font-medium text-ink">
              Feedback
              <span className={`num font-mono text-xs ${tooMany ? "text-neg" : "text-muted"}`}>{rows.length} / {MAX}</span>
            </span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} disabled={busy}
              placeholder={"Checkout took forever on my phone\nLove the care guides that come with each plant\nShipping fee only shows up at the last step"}
              className={`${control} mt-2 resize-y font-mono text-sm leading-relaxed`} />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button onClick={run} disabled={!canRun} className="btn-primary" aria-busy={busy}>
            {busy ? "Analyzing…" : "Analyze"}
          </button>
          {!csv && (
            <>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" id="csv" onChange={(e) => onFile(e.target.files?.[0])} />
              <label htmlFor="csv" className="link cursor-pointer text-sm">Upload a CSV instead</label>
            </>
          )}
          {busy && <span className="font-mono text-xs text-muted">Reading {rows.length} responses — usually under a minute</span>}
        </div>

        {error && <p role="alert" className="text-sm text-neg">{error}</p>}
        {tooMany && <p className="text-sm text-neg">That’s {rows.length} responses. Split it into batches of {MAX} or fewer.</p>}
        {!error && !tooMany && rows.length > 0 && rows.length < 3 && <p className="text-sm text-muted">Add at least 3 responses so there’s something to group.</p>}
      </div>
      </div>
    </div>
  );
}
