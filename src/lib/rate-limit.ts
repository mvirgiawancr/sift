import "server-only";

/*
 * Best-effort, in-memory rate limiting for the public demo.
 * Limits live in the memory of one server instance, so on serverless hosts they reset on
 * cold starts and are not shared between instances. That is fine for keeping a portfolio
 * demo's API bill small; use a shared store (e.g. Upstash Redis) for anything stricter.
 *
 *   RATE_LIMIT_PER_HOUR   analyses per visitor (IP) per rolling hour   default 5
 *   RATE_LIMIT_PER_DAY    analyses for everyone per rolling 24 hours   default 100
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const perIp = new Map<string, number[]>();
let global: number[] = [];

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
}

export type LimitResult = { ok: true; at: number } | { ok: false; retryAfter: number; reason: "visitor" | "global" };

/** Checks both limits and, when allowed, records the attempt. */
export function takeToken(ip: string, now = Date.now()): LimitResult {
  const perHour = num(process.env.RATE_LIMIT_PER_HOUR, 5);
  const perDay = num(process.env.RATE_LIMIT_PER_DAY, 100);

  global = global.filter((t) => now - t < DAY);
  if (global.length >= perDay) {
    return { ok: false, reason: "global", retryAfter: Math.ceil((global[0] + DAY - now) / 1000) };
  }

  const mine = (perIp.get(ip) ?? []).filter((t) => now - t < HOUR);
  if (mine.length >= perHour) {
    perIp.set(ip, mine);
    return { ok: false, reason: "visitor", retryAfter: Math.ceil((mine[0] + HOUR - now) / 1000) };
  }

  mine.push(now);
  perIp.set(ip, mine);
  global.push(now);

  // keep the map from growing forever on a long-lived instance
  if (perIp.size > 5000) {
    for (const [k, v] of perIp) if (!v.some((t) => now - t < HOUR)) perIp.delete(k);
  }
  return { ok: true, at: now };
}

/** Give back a token when the request failed for reasons that aren't the visitor's fault. */
export function refundToken(ip: string, at: number) {
  const mine = perIp.get(ip);
  if (mine) perIp.set(ip, mine.filter((t) => t !== at));
  const i = global.indexOf(at);
  if (i >= 0) global.splice(i, 1);
}

export function humanWait(seconds: number) {
  const m = Math.ceil(seconds / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  const h = Math.ceil(m / 60);
  return `${h} hour${h === 1 ? "" : "s"}`;
}
