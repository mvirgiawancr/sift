import type { Dataset, FeedbackItem, Sentiment, Theme } from "./types";

/* Fictional product: Bloomcart, an app that sells and delivers house plants. */

const themes: Theme[] = [
  {
    id: "checkout",
    name: "Slow checkout",
    summary: "Payment step freezes or takes 20+ seconds, especially on mobile data. Several customers abandoned their cart.",
    action: "Profile the payment step on 3G, move address validation to the background, and add a progress state.",
    priority: "high",
  },
  {
    id: "damage",
    name: "Plants arrive damaged",
    summary: "Broken pots and bent stems after delivery, mostly for large plants shipped outside the city.",
    action: "Switch large plants to upright boxes with pot anchors and offer one-tap replacement photos.",
    priority: "high",
  },
  {
    id: "pricing",
    name: "Shipping costs",
    summary: "Shipping fees feel high relative to plant prices; customers want a free-shipping threshold.",
    action: "Test free shipping above $45 and show the fee earlier, on the product page.",
    priority: "medium",
  },
  {
    id: "requests",
    name: "Feature requests",
    summary: "Dark mode, watering reminders and a wishlist are the most requested additions.",
    action: "Ship watering reminders first — it ties directly to repeat purchases.",
    priority: "medium",
  },
  {
    id: "support",
    name: "Customer support",
    summary: "Chat replies are friendly and fast during the day, but weekend tickets wait too long.",
    action: "Add weekend coverage or an auto-reply with expected response time.",
    priority: "low",
  },
  {
    id: "care",
    name: "Plant care guides",
    summary: "Customers love the care cards and in-app guides; they are a key reason for loyalty.",
    action: "Keep investing — turn top guides into short videos and link them in delivery emails.",
    priority: "low",
  },
];

type Row = [string, string, string, Sentiment, number, string];

const rows: Row[] = [
  ["Checkout took forever, I almost gave up on my order.", "App Store", "2026-08-03", "negative", -0.7, "checkout"],
  ["The care card that came with my monstera is so helpful!", "Survey", "2026-08-03", "positive", 0.8, "care"],
  ["Would love a dark mode for late-night plant shopping.", "App Store", "2026-08-04", "neutral", 0.1, "requests"],
  ["My fiddle leaf fig arrived with a cracked pot.", "Email", "2026-08-05", "negative", -0.8, "damage"],
  ["Support replied in 5 minutes and sent a replacement. Amazing.", "Twitter", "2026-08-06", "positive", 0.9, "support"],
  ["Shipping costs more than the plant itself sometimes.", "Survey", "2026-08-07", "negative", -0.5, "pricing"],
  ["Love the watering tips in the app, my plants are thriving.", "App Store", "2026-08-10", "positive", 0.85, "care"],
  ["Payment page froze twice on mobile data.", "App Store", "2026-08-11", "negative", -0.75, "checkout"],
  ["Please add reminders for when to water each plant.", "Survey", "2026-08-12", "neutral", 0.15, "requests"],
  ["Box was crushed, two stems were snapped.", "Email", "2026-08-13", "negative", -0.85, "damage"],
  ["Great selection, but checkout is painfully slow.", "App Store", "2026-08-14", "negative", -0.4, "checkout"],
  ["Guides are clear and beginner friendly. 10/10.", "Twitter", "2026-08-15", "positive", 0.9, "care"],
  ["A wishlist would be nice so I can save plants for later.", "Survey", "2026-08-17", "neutral", 0.1, "requests"],
  ["Weekend ticket took 3 days to get a reply.", "Email", "2026-08-18", "negative", -0.6, "support"],
  ["Free shipping over a certain amount would get me to order more.", "Survey", "2026-08-19", "neutral", -0.1, "pricing"],
  ["Checkout spinner never ends on my phone.", "App Store", "2026-08-20", "negative", -0.8, "checkout"],
  ["Plant arrived healthy and beautifully packed!", "Twitter", "2026-08-21", "positive", 0.8, "damage"],
  ["The repotting guide saved my snake plant.", "Survey", "2026-08-24", "positive", 0.85, "care"],
  ["I entered my card 3 times before it went through.", "App Store", "2026-08-25", "negative", -0.7, "checkout"],
  ["Leaves were bent and soil spilled everywhere in the box.", "Email", "2026-08-26", "negative", -0.75, "damage"],
  ["Chat support is super friendly.", "Twitter", "2026-08-27", "positive", 0.7, "support"],
  ["Shipping fee showed up only at the last step, felt sneaky.", "App Store", "2026-08-28", "negative", -0.6, "pricing"],
  ["Dark mode please, my eyes hurt at night.", "App Store", "2026-08-29", "neutral", -0.05, "requests"],
  ["Checkout is so slow I switched to buying on desktop.", "Survey", "2026-08-31", "negative", -0.65, "checkout"],
  ["Pot arrived in pieces. Replacement was quick though.", "Email", "2026-09-01", "negative", -0.3, "damage"],
  ["Care cards are the best part of ordering from you.", "Survey", "2026-09-02", "positive", 0.9, "care"],
  ["Would pay for a plant health check feature.", "Survey", "2026-09-03", "neutral", 0.2, "requests"],
  ["Payment failed but my card was still charged.", "Email", "2026-09-04", "negative", -0.9, "checkout"],
  ["Nobody answered my message all weekend.", "Twitter", "2026-09-05", "negative", -0.55, "support"],
  ["Plants are cheap but delivery doubles the price.", "App Store", "2026-09-07", "negative", -0.5, "pricing"],
  ["Checkout took 30 seconds on 4G. Too slow.", "App Store", "2026-09-08", "negative", -0.6, "checkout"],
  ["My big bird of paradise arrived snapped in half.", "Email", "2026-09-09", "negative", -0.9, "damage"],
  ["The light guide helped me pick the perfect spot.", "App Store", "2026-09-10", "positive", 0.75, "care"],
  ["Watering reminders would make this app perfect.", "App Store", "2026-09-11", "neutral", 0.3, "requests"],
  ["Support fixed my order issue in one message.", "Twitter", "2026-09-12", "positive", 0.8, "support"],
  ["Stuck on the payment screen again.", "App Store", "2026-09-14", "negative", -0.7, "checkout"],
  ["Pot was cracked but plant was fine.", "Survey", "2026-09-15", "negative", -0.35, "damage"],
  ["Love how every plant comes with a story and a guide.", "Twitter", "2026-09-16", "positive", 0.85, "care"],
  ["Please show shipping cost on the product page.", "Survey", "2026-09-17", "neutral", -0.15, "pricing"],
  ["Checkout crashed and I lost my whole cart.", "App Store", "2026-09-18", "negative", -0.85, "checkout"],
  ["Add a wishlist and gift option please!", "Survey", "2026-09-19", "neutral", 0.2, "requests"],
  ["Delivery box was soaked and the plant was crushed.", "Email", "2026-09-21", "negative", -0.8, "damage"],
  ["Checkout finally worked after 4 tries.", "App Store", "2026-09-22", "negative", -0.5, "checkout"],
  ["Care guides are gold. Please keep them coming.", "Survey", "2026-09-23", "positive", 0.9, "care"],
  ["Weekend support is basically nonexistent.", "Twitter", "2026-09-24", "negative", -0.5, "support"],
  ["Payment page is slow but the plants are worth it.", "App Store", "2026-09-25", "negative", -0.25, "checkout"],
  ["Free shipping over $50 would be a game changer.", "Survey", "2026-09-26", "neutral", 0.05, "pricing"],
  ["Checkout took a full minute today.", "App Store", "2026-09-27", "negative", -0.75, "checkout"],
];

const items: FeedbackItem[] = rows.map(([text, source, date, sentiment, score, themeId], i) => ({
  id: `s${i + 1}`,
  text,
  source,
  date,
  sentiment,
  score,
  themeId,
}));

export const SAMPLE_ID = "sample";

export const sampleDataset: Dataset = {
  id: SAMPLE_ID,
  name: "Bloomcart feedback",
  product: "Bloomcart",
  createdAt: "2026-09-27",
  items,
  themes,
};
