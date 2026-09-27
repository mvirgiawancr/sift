import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Wordmark } from "@/components/ui";
import { sampleDataset } from "@/lib/sample";
import { themeStats } from "@/lib/stats";

const stats = themeStats(sampleDataset).slice(0, 4);
const maxMentions = Math.max(...stats.map((s) => s.mentions));
const inputRows = [
  ["App Store", "Checkout took a full minute today."],
  ["Email", "My big bird of paradise arrived snapped in half."],
  ["Survey", "Free shipping over $50 would be a game changer."],
  ["Twitter", "Care guides are gold. Please keep them coming."],
];

const tour = [
  {
    img: "/shots/overview.png",
    title: "Open it and see what hurts most.",
    body: "The overview puts the costliest problem on top, with the numbers and a real customer quote beside it. Everything else is ranked underneath.",
  },
  {
    img: "/shots/theme.png",
    title: "Every theme comes with a next step.",
    body: "Each theme gets a plain-language summary, one recommended fix, its trend week by week, and every response that belongs to it.",
  },
  {
    img: "/shots/feedback.png",
    title: "Nothing is hidden behind the averages.",
    body: "Search and filter every single response by sentiment or theme, so you can check the grouping yourself.",
  },
];

const steps = [
  ["Paste", "Drop in reviews, tickets or survey answers — one per line, or a CSV export with a text column."],
  ["Group", "The AI reads every response, clusters them into a handful of themes and scores each one from negative to positive."],
  ["Rank", "Themes are ordered by impact: how many people mention it, weighted by how unhappy they are."],
];

export default function Landing() {
  return (
    <>
      <Reveal />
      <header className="sticky top-0 z-[200] border-b border-rule bg-paper/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Sift home"><Wordmark /></Link>
            <div className="hidden gap-6 text-sm sm:flex">
              <a href="#tour" className="link text-ink-2">Tour</a>
              <a href="#how" className="link text-ink-2">How it works</a>
            </div>
          </div>
          <Link href="/app" className="btn-primary text-sm">Open the demo</Link>
        </nav>
      </header>

      <main>
        {/* hero: title left, live demo right */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-12 md:px-6 md:pb-32 md:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="min-w-0">
            <h1 className="text-[clamp(2.5rem,4.5vw+0.75rem,4.5rem)] leading-[1.02]">Every review, sorted by what to fix.</h1>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-2">
              Paste App Store reviews, support tickets or survey answers. Sift groups them into themes, scores every response, and shows which problem is costing you the most customers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/app" className="btn-primary">Open the demo</Link>
              <Link href="/app/import" className="link font-medium">Analyze your own feedback →</Link>
            </div>
            <p className="mt-6 font-mono text-xs text-muted">No sign-up · demo uses sample data from a fictional plant shop</p>
          </div>

          <figure className="min-w-0 overflow-hidden rounded-[10px] border border-graphite-rule bg-graphite font-mono text-[13px] text-graphite-ink shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-graphite-rule px-4 py-2.5 text-xs text-graphite-muted">
              <span>bloomcart-feedback.csv</span>
              <span className="num">{sampleDataset.items.length} rows</span>
            </div>
            <ul className="space-y-2 px-4 py-4">
              {inputRows.map(([src, text], i) => (
                <li key={i} className="seq-in grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3" style={{ "--i": i, "--d": "300ms" } as React.CSSProperties}>
                  <span className="text-graphite-muted">{src}</span>
                  <span className="truncate">{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-y border-graphite-rule bg-graphite-2 px-4 py-2.5 text-xs text-graphite-muted">
              <span>themes, ranked by impact</span>
              <span className="seq-in rounded-[4px] bg-accent px-1.5 py-0.5 text-accent-ink" style={{ "--d": "900ms" } as React.CSSProperties}>{sampleDataset.themes.length} found</span>
            </div>
            <ul className="space-y-3 px-4 py-4">
              {stats.map((s, i) => (
                <li key={s.theme.id} className="seq-in grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-4" style={{ "--i": i, "--d": "1050ms" } as React.CSSProperties}>
                  <span className="truncate font-sans text-sm text-graphite-ink">{s.theme.name}</span>
                  <span className="bar-grow flex h-1.5 gap-[2px]" style={{ width: `${(s.mentions / maxMentions) * 100}%`, "--i": i, "--d": "1150ms" } as React.CSSProperties}>
                    {s.negative > 0 && <i className="rounded-[2px] bg-neg" style={{ flexGrow: s.negative }} />}
                    {s.neutral > 0 && <i className="rounded-[2px] bg-neu" style={{ flexGrow: s.neutral }} />}
                    {s.positive > 0 && <i className="rounded-[2px] bg-pos" style={{ flexGrow: s.positive }} />}
                  </span>
                  <span className="num text-right text-graphite-muted">{s.mentions}×</span>
                </li>
              ))}
            </ul>
          </figure>
        </section>

        {/* workbench tour: real captures, no fake chrome */}
        <section id="tour" className="scroll-mt-20 border-t border-rule">
          <div className="mx-auto max-w-6xl px-4 py-24 md:px-6">
            <h2 className="max-w-[18ch] text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">What you get after one paste</h2>
            <div className="mt-16 space-y-24">
              {tour.map((t, i) => (
                <article key={t.img} className={`reveal grid items-start gap-8 lg:gap-14 ${i % 2 ? "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]"}`}>
                  <div className={`min-w-0 lg:pt-6 ${i % 2 ? "lg:order-2" : ""}`}>
                    <h3 className="text-2xl">{t.title}</h3>
                    <p className="mt-3 max-w-[42ch] leading-relaxed text-ink-2">{t.body}</p>
                  </div>
                  <figure className="min-w-0 overflow-hidden rounded-[10px] border border-rule bg-paper shadow-[var(--shadow-card)]">
                    <Image src={t.img} alt={t.title} width={2400} height={1800} className="h-auto w-full" sizes="(min-width: 1024px) 720px, 100vw" />
                  </figure>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* the one dark band */}
        <section id="how" className="scroll-mt-16 bg-graphite text-graphite-ink">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div>
              <h2 className="text-[clamp(1.85rem,3vw+0.5rem,2.75rem)] !text-graphite-ink">From a pile of text to a fix list</h2>
              <p className="mt-4 max-w-[40ch] leading-relaxed text-graphite-muted">
                Any AI model with an OpenAI-compatible API can do the reading. Your data stays in your browser unless you run an analysis.
              </p>
            </div>
            <ol className="reveal border-t border-graphite-rule">
              {steps.map(([name, body]) => (
                <li key={name} className="grid gap-2 border-b border-graphite-rule py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
                  <span className="font-display text-xl text-graphite-ink">{name}</span>
                  <p className="leading-relaxed text-graphite-ink/80">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-4 py-24 md:px-6">
          <h2 className="max-w-[20ch] text-[clamp(1.85rem,3vw+0.5rem,2.75rem)]">See what your customers keep telling you.</h2>
          <Link href="/app" className="btn-primary">Open the demo</Link>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted md:px-6">
          <span className="flex items-center gap-3"><Wordmark className="!text-base" /> Customer feedback, sorted by what to fix.</span>
          <span>Built by <a href="https://contra.com/moch_virgiawan_caesar_r_w19nvsk6" className="link">mvirgiawancr</a></span>
        </div>
      </footer>
    </>
  );
}
