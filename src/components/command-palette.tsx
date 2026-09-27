"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDataset } from "./dataset-context";

interface Cmd {
  id: string;
  label: string;
  hint: string;
  href: string;
}

/** ⌘K / Ctrl+K palette: jump to any page or theme. */
export function CommandPalette() {
  const router = useRouter();
  const { dataset, href } = useDataset();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const cmds: Cmd[] = useMemo(
    () => [
      { id: "overview", label: "Overview", hint: "page", href: href("/app") },
      { id: "themes", label: "Themes", hint: "page", href: href("/app/themes") },
      { id: "feedback", label: "All feedback", hint: "page", href: href("/app/feedback") },
      { id: "import", label: "Analyze new feedback", hint: "action", href: "/app/import" },
      ...dataset.themes.map((t) => ({ id: t.id, label: t.name, hint: "theme", href: href(`/app/themes/${t.id}`) })),
    ],
    [dataset.themes, href],
  );
  const list = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const show = () => {
      setQ("");
      setSel(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      }
    };
    const onOpen = show;
    window.addEventListener("keydown", onKey);
    window.addEventListener("sift:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sift:palette", onOpen);
    };
  }, []);

  if (!open) return null;

  const go = (c: Cmd | undefined) => {
    if (!c) return;
    setOpen(false);
    router.push(c.href);
  };

  return (
    <div className="fixed inset-0 z-[400] grid place-items-start justify-center bg-ink/20 px-4 pt-[14vh]" onMouseDown={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-[10px] border border-rule-2 bg-paper shadow-[var(--shadow-pop)]"
        onMouseDown={(e) => e.stopPropagation()}>
        <input autoFocus value={q} placeholder="Jump to a page or theme…"
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            if (e.key === "Enter") go(list[sel]);
          }}
          className="w-full border-b border-rule bg-transparent px-4 py-3.5 font-mono text-sm text-ink outline-none placeholder:text-muted" />
        <ul className="max-h-80 overflow-y-auto p-1.5" role="listbox">
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches “{q}”.</li>}
          {list.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === sel}>
              <button onMouseEnter={() => setSel(i)} onClick={() => go(c)}
                className={`flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-left text-sm ${i === sel ? "bg-accent-soft text-ink" : "text-ink-2"}`}>
                {c.label}
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function openPalette() {
  window.dispatchEvent(new Event("sift:palette"));
}
