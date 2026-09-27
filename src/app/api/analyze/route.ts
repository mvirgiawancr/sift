import { analyzeFeedback, llmConfigured, MAX_ITEMS } from "@/lib/llm";
import { clientIp, humanWait, refundToken, takeToken } from "@/lib/rate-limit";
import type { RawFeedback } from "@/lib/types";

export async function POST(request: Request) {
  if (!llmConfigured()) {
    return Response.json(
      { error: "AI analysis is not configured on this server. Try the sample data instead." },
      { status: 503 },
    );
  }

  let body: { name?: string; items?: RawFeedback[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const items = (body.items ?? []).filter((i) => typeof i?.text === "string" && i.text.trim());
  if (items.length < 3) return Response.json({ error: "Add at least 3 pieces of feedback." }, { status: 400 });
  if (items.length > MAX_ITEMS) return Response.json({ error: `Up to ${MAX_ITEMS} items per analysis.` }, { status: 400 });

  // validate first, then spend a token — bad input shouldn't count against the visitor
  const ip = clientIp(request);
  const limit = takeToken(ip);
  if (!limit.ok) {
    const wait = humanWait(limit.retryAfter);
    const error =
      limit.reason === "visitor"
        ? `You’ve reached the demo limit of analyses for this hour. Try again in about ${wait}, or explore the sample data meanwhile.`
        : `The demo has reached its daily analysis limit. Try again in about ${wait}, or explore the sample data meanwhile.`;
    return Response.json({ error }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  try {
    const dataset = await analyzeFeedback(items, (body.name || "My feedback").slice(0, 60));
    return Response.json({ dataset });
  } catch (e) {
    console.error(e);
    refundToken(ip, limit.at);
    return Response.json({ error: "The AI could not analyze this feedback. Please try again." }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({ configured: llmConfigured() });
}
