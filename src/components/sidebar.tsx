"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDataset } from "./dataset-context";
import { openPalette } from "./command-palette";
import { Wordmark } from "./ui";

const NAV = [
  { href: "/app", label: "Overview" },
  { href: "/app/themes", label: "Themes" },
  { href: "/app/feedback", label: "All feedback" },
];

export function Sidebar() {
  const path = usePathname();
  const { dataset, datasets, select, href } = useDataset();

  return (
    <aside className="flex flex-col gap-6 border-b border-rule bg-paper-2 px-4 py-5 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Sift home"><Wordmark /></Link>
        <button onClick={openPalette}
          className="rounded-[6px] border border-rule-2 bg-paper px-1.5 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-ink">
          ⌘K
        </button>
      </div>

      <label className="block">
        <span className="label">Dataset</span>
        <select value={dataset.id} onChange={(e) => select(e.target.value)}
          className="mt-1.5 w-full rounded-[6px] border border-rule-2 bg-paper px-2.5 py-2 text-sm text-ink outline-none transition-colors hover:border-neutral focus-visible:border-accent">
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>

      <nav className="flex gap-4 overflow-x-auto md:flex-col md:gap-0.5">
        {NAV.map((n) => {
          const on = n.href === "/app" ? path === "/app" : path.startsWith(n.href);
          return (
            <Link key={n.href} href={href(n.href)} aria-current={on ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-[6px] py-1.5 text-sm transition-colors md:px-2 ${on ? "font-medium text-ink md:bg-paper" : "text-neutral hover:text-ink"}`}>
              <span className={`h-1.5 w-1.5 rounded-[2px] ${on ? "bg-accent" : "bg-transparent"}`} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/app/import" className="btn-primary justify-center text-sm md:mt-auto">
        Analyze feedback
      </Link>
    </aside>
  );
}
