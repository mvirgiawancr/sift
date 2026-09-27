import { fmtDate, type ThemeStat, type WeekPoint } from "@/lib/stats";

/** Weekly health (0–100) as a line over faint volume columns. */
export function TrendChart({ data, height = 220 }: { data: WeekPoint[]; height?: number }) {
  const W = 760, H = height, pl = 4, pr = 86, pt = 14, pb = 28;
  const iw = W - pl - pr, ih = H - pt - pb;
  const maxC = Math.max(1, ...data.map((d) => d.count));
  const step = data.length > 1 ? iw / (data.length - 1) : 0;
  const x = (i: number) => pl + (data.length > 1 ? i * step : iw / 2);
  // fit the y-axis to the data (health units 0–100) so small shifts are readable
  const hs = data.map((d) => (d.avgScore + 1) * 50);
  const lo = Math.max(0, Math.floor((Math.min(...hs) - 8) / 10) * 10);
  const hi = Math.min(100, Math.ceil((Math.max(...hs) + 8) / 10) * 10);
  const yH = (h: number) => pt + ih - ((h - lo) / Math.max(1, hi - lo)) * ih;
  const y = (score: number) => yH((score + 1) * 50);
  const pts = data.map((d, i) => [x(i), y(d.avgScore)] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const label = { fontFamily: "var(--font-label)", fontSize: 10.5, fill: "var(--color-muted)" };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Weekly health score and feedback volume">
      {[hi, ...(lo < 50 && hi > 50 ? [50] : []), lo].map((v) => {
        const yy = yH(v);
        return (
          <g key={v}>
            <line x1={pl} x2={W - pr} y1={yy} y2={yy} style={{ stroke: "var(--color-rule)" }} strokeDasharray={v === 50 ? "3 3" : undefined} />
            <text x={W - pr + 8} y={yy + 3.5} style={label}>{v === 50 ? "50 · neutral" : v}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.count / maxC) * ih * 0.4;
        return <rect key={d.week} x={x(i) - 7} y={pt + ih - h} width="14" height={h} rx="2" style={{ fill: "var(--color-paper-3)" }} />;
      })}
      <path d={line} pathLength={1} className="draw" fill="none" strokeWidth="2" strokeLinejoin="round" style={{ stroke: "var(--color-accent)" }} />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === pts.length - 1 ? 4 : 2.5} strokeWidth="2" className="draw-after"
          style={{ ["--i" as string]: i, fill: i === pts.length - 1 ? "var(--color-accent)" : "var(--color-paper)", stroke: "var(--color-accent)" }} />
      ))}
      {last && (
        <text x={last[0] - 8} y={last[1] - 10} textAnchor="end" className="draw-after" style={{ ...label, fill: "var(--color-ink)", ["--i" as string]: pts.length }}>
          {Math.round((data[data.length - 1].avgScore + 1) * 50)}
        </text>
      )}
      {data.map((d, i) => (
        <text key={d.week} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} style={label}>
          {fmtDate(d.week).toUpperCase()}
        </text>
      ))}
    </svg>
  );
}

/** Proportion strip: negative | neutral | positive, 2px gaps. */
export function SplitBar({ pos, neu, neg, className = "h-1.5", grow }: { pos: number; neu: number; neg: number; className?: string; grow?: number }) {
  const parts: [number, string][] = [
    [neg, "var(--color-neg)"],
    [neu, "var(--color-neu)"],
    [pos, "var(--color-pos)"],
  ];
  return (
    <div className={`flex w-full gap-[2px] ${grow !== undefined ? "bar-grow" : ""} ${className}`} style={grow !== undefined ? ({ "--i": grow } as React.CSSProperties) : undefined}>
      {parts.map(([v, c], i) => (v > 0 ? <div key={i} className="rounded-[2px]" style={{ flexGrow: v, background: c }} /> : null))}
    </div>
  );
}

export function ThemeBar({ s, max, grow }: { s: ThemeStat; max: number; grow?: number }) {
  return (
    <div style={{ width: `${Math.max(8, (s.mentions / max) * 100)}%` }}>
      <SplitBar pos={s.positive} neu={s.neutral} neg={s.negative} grow={grow} />
    </div>
  );
}
