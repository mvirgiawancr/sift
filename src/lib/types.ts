export type Sentiment = "positive" | "neutral" | "negative";
export type Priority = "high" | "medium" | "low";

export interface FeedbackItem {
  id: string;
  text: string;
  source: string;
  date: string; // ISO yyyy-mm-dd
  sentiment: Sentiment;
  score: number; // -1 (very negative) .. 1 (very positive)
  themeId: string;
}

export interface Theme {
  id: string;
  name: string;
  summary: string;
  action: string;
  priority: Priority;
}

export interface Dataset {
  id: string;
  name: string;
  product: string;
  createdAt: string;
  items: FeedbackItem[];
  themes: Theme[];
}

/** Raw feedback before analysis — what the user imports. */
export interface RawFeedback {
  text: string;
  source?: string;
  date?: string;
}
