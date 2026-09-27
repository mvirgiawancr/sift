import { analyzeFeedback, llmConfigured, MAX_ITEMS } from "@/lib/llm";
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

  try {
    const dataset = await analyzeFeedback(items, (body.name || "My feedback").slice(0, 60));
    return Response.json({ dataset });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "The AI could not analyze this feedback. Please try again." }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({ configured: llmConfigured() });
}
