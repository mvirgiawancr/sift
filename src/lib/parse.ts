import type { RawFeedback } from "./types";

/** Minimal RFC-4180 CSV parser: quoted fields, escaped quotes, CRLF. */
function parseCsv(src: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') q = false;
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const TEXT_COLS = ["text", "feedback", "review", "comment", "message", "body", "content"];

/** CSV with a header row: uses a text-like column (or the first), plus optional source/date. */
export function fromCsv(src: string): RawFeedback[] {
  const rows = parseCsv(src);
  if (rows.length < 2) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const ti = Math.max(0, head.findIndex((h) => TEXT_COLS.includes(h)));
  const si = head.findIndex((h) => ["source", "channel", "platform"].includes(h));
  const di = head.findIndex((h) => ["date", "created", "created_at", "timestamp"].includes(h));
  return rows.slice(1).map((r) => {
    const d = di >= 0 ? new Date(r[di]) : null;
    return {
      text: (r[ti] ?? "").trim(),
      source: si >= 0 ? r[si]?.trim() || undefined : undefined,
      date: d && !isNaN(+d) ? d.toISOString().slice(0, 10) : undefined,
    };
  }).filter((r) => r.text);
}

/** Pasted text: one piece of feedback per line. */
export function fromText(src: string): RawFeedback[] {
  return src.split(/\r?\n/).map((l) => l.replace(/^\s*[-*•\d.)]+\s+/, "").trim()).filter((l) => l.length > 2).map((text) => ({ text, source: "Pasted" }));
}
