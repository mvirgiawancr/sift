import "server-only";
import type { Dataset, FeedbackItem, Priority, RawFeedback, Sentiment, Theme } from "./types";

/*
 * Provider-agnostic: any OpenAI-compatible chat completions endpoint works.
 *   LLM_API_KEY   required
 *   LLM_BASE_URL  default https://api.openai.com/v1
 *                 (Gemini: https://generativelanguage.googleapis.com/v1beta/openai)
 *   LLM_MODEL     default gpt-4o-mini
 */

export const MAX_ITEMS = 200;

export function llmConfigured() {
  return Boolean(process.env.LLM_API_KEY);
}

const SYSTEM = `You analyze customer feedback for a product team.
Group the feedback into 3-7 themes. For each theme write a short name (2-4 words), a one-sentence summary of what customers say, one concrete recommended action, and a priority (high, medium, low) based on how many people it affects and how negative they are.
For every feedback item give its sentiment (positive, neutral, negative), a score from -1 (very negative) to 1 (very positive), and the id of its theme.
Reply with JSON only, in this shape:
{"themes":[{"id":"t1","name":"","summary":"","action":"","priority":"high"}],"items":[{"i":0,"sentiment":"negative","score":-0.6,"theme":"t1"}]}`;

interface LlmReply {
  themes: { id: string; name: string; summary: string; action: string; priority: Priority }[];
  items: { i: number; sentiment: Sentiment; score: number; theme: string }[];
}

const clamp = (n: number) => Math.max(-1, Math.min(1, Number.isFinite(n) ? n : 0));
const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

export async function analyzeFeedback(raw: RawFeedback[], name: string): Promise<Dataset> {
  const base = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const list = raw.map((r, i) => `${i}. ${r.text.replace(/\s+/g, " ").slice(0, 600)}`).join("\n");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Product: ${name}\n\nFeedback:\n${list}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const body = await res.json();
  const content: string = body.choices?.[0]?.message?.content ?? "";
  const json = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, "")) as LlmReply;

  const themes: Theme[] = json.themes.map((t) => ({
    id: String(t.id),
    name: t.name,
    summary: t.summary,
    action: t.action,
    priority: PRIORITIES.includes(t.priority) ? t.priority : "medium",
  }));
  const byIndex = new Map(json.items.map((it) => [it.i, it]));
  const today = new Date().toISOString().slice(0, 10);

  const items: FeedbackItem[] = raw.map((r, i) => {
    const a = byIndex.get(i);
    return {
      id: `f${i + 1}`,
      text: r.text,
      source: r.source || "Imported",
      date: r.date || today,
      sentiment: a && SENTIMENTS.includes(a.sentiment) ? a.sentiment : "neutral",
      score: clamp(a?.score ?? 0),
      themeId: a && themes.some((t) => t.id === String(a.theme)) ? String(a.theme) : themes[0]?.id ?? "other",
    };
  });

  return {
    id: crypto.randomUUID(),
    name,
    product: name,
    createdAt: today,
    items,
    themes,
  };
}
