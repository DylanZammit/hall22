import { readFile, writeFile } from "node:fs/promises";
import { CATEGORY, cleanArticle, discoverTrialLinks, fetchPage, isCompletedSitting, parseStoredUpdates } from "./lib/maltatoday.mjs";

const OUTPUT = new URL("../data/latest.js", import.meta.url);
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Set OPENAI_API_KEY before running npm run update");

const previousSource = await readFile(OUTPUT, "utf8");
const storedUpdates = parseStoredUpdates(previousSource);
const categoryHtml = await fetchPage(CATEGORY);
const links = discoverTrialLinks(categoryHtml);
if (!links.length) throw new Error("No current Yorgen Fenech trial article found on MaltaToday");

let selected;
for (const sourceUrl of links.slice(0, 5)) {
  const articleHtml = await fetchPage(sourceUrl);
  const articleText = cleanArticle(articleHtml);
  if (isCompletedSitting(articleText)) {
    selected = { sourceUrl, articleHtml, articleText };
    break;
  }
}
if (!selected) {
  console.log("No completed MaltaToday sitting is available yet; leaving the site unchanged.");
  process.exit(0);
}
if (storedUpdates.some(update => update.day.sourceUrl === selected.sourceUrl)) {
  console.log(`Already recorded ${selected.sourceUrl}; leaving the site unchanged.`);
  process.exit(0);
}

const previousDay = Math.max(0, ...storedUpdates.map(update => Number(update.day.day) || 0), 25);
const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
    instructions: [
      "You maintain a public, neutral trial tracker using MaltaToday as the sole factual source.",
      "Summarise only what is present in the supplied article. Preserve attribution.",
      "Never turn allegations or testimony into findings of fact.",
      "The lead title must capture the single most important development at a glance.",
      "Relationship updates are directed: speaker/from -> person mentioned/to.",
      "Tone: -1 predominantly adverse/hostile, 0 mixed/neutral, 1 supportive/friendly.",
      "Counts are conservative estimates of distinct substantive mentions in this article.",
      `The next trial day must be greater than ${previousDay}; use the day number explicitly reported by MaltaToday.`
    ].join("\n"),
    input: `Previous recorded day: ${previousDay}\nSource URL: ${selected.sourceUrl}\n\nMALTA TODAY ARTICLE:\n${selected.articleText.slice(0, 120000)}`,
    text: { format: { type: "json_schema", name: "trial_daily_update", strict: true, schema: schema() } }
  })
});
let update;
if (response.ok) {
  const result = await response.json();
  const outputText = result.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
  if (!outputText) throw new Error("OpenAI returned no structured output");
  update = JSON.parse(outputText);
} else {
  const error = await response.json().catch(() => ({}));
  console.warn(`OpenAI unavailable (${response.status}: ${error.error?.code || "unknown"}); using MaltaToday metadata fallback.`);
  update = fallbackUpdate(selected.articleHtml, selected.articleText, selected.sourceUrl, previousDay);
}
update.day.sourceUrl = selected.sourceUrl;
if (update.day.day <= previousDay) throw new Error(`Generated day ${update.day.day} is not newer than ${previousDay}`);

storedUpdates.push(update);
storedUpdates.sort((a, b) => a.day.day - b.day.day);
await writeFile(OUTPUT, `window.DAILY_UPDATES = ${JSON.stringify(storedUpdates, null, 2)};\n`);
console.log(`Updated day ${update.day.day} from ${selected.sourceUrl}`);

function schema() {
  return {
    type: "object", additionalProperties: false, required: ["day", "lead", "relationUpdates"],
    properties: {
      day: {
        type: "object", additionalProperties: false,
        required: ["day", "date", "type", "title", "summary", "points", "sourceTitle"],
        properties: {
          day: { type: "integer" }, date: { type: "string" },
          type: { type: "string", enum: ["case", "forensics", "testimony"] },
          title: { type: "string" }, summary: { type: "string" },
          points: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          sourceTitle: { type: "string" }
        }
      },
      lead: {
        type: "object", additionalProperties: false, required: ["label", "title", "summary"],
        properties: { label: { type: "string" }, title: { type: "string" }, summary: { type: "string" } }
      },
      relationUpdates: {
        type: "array", items: {
          type: "object", additionalProperties: false,
          required: ["from", "to", "count", "tone", "context", "days"],
          properties: {
            from: { type: "string" }, to: { type: "string" }, count: { type: "integer", minimum: 1 },
            tone: { type: "integer", minimum: -1, maximum: 1 }, context: { type: "string" }, days: { type: "string" }
          }
        }
      }
    }
  };
}

function fallbackUpdate(html, text, sourceUrl, previousDay) {
  const title = decode(matchMeta(html, "og:title") || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "Yorgen Fenech trial update")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const description = decode(matchMeta(html, "og:description") || "MaltaToday’s latest completed report from the Yorgen Fenech jury trial.")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const reportedDay = Number(
    sourceUrl.match(/day[_-]?(\d+)/i)?.[1] ||
    text.match(/(?:enters?|day)\s+(?:its\s+)?(\d+)(?:st|nd|rd|th)?\s+day/i)?.[1] ||
    previousDay + 1
  );
  const dateMatch = text.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+2026\b/i);
  const date = dateMatch ? `${dateMatch[1]} ${dateMatch[2].slice(0, 3)}` : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Europe/Malta" }).format(new Date());
  const sentences = description.split(/(?<=[.!?])\s+/).filter(Boolean);
  return {
    day: {
      day: reportedDay,
      date,
      type: /forensic|explosive|phone|digital|scene of crime/i.test(`${title} ${description}`) ? "forensics" : "testimony",
      title: title.replace(/^LIVE\s*[|︱:-]*\s*/i, ""),
      summary: description,
      points: [
        sentences[0] || title,
        sentences[1] || "The latest completed sitting was extracted directly from MaltaToday.",
        "No allegation reported in court is treated as a finding of fact."
      ],
      sourceTitle: title
    },
    lead: {
      label: `Yesterday · ${date} 2026`,
      title: title.replace(/^LIVE\s*[|︱:-]*\s*/i, ""),
      summary: description
    },
    relationUpdates: []
  };
}

function matchMeta(html, property) {
  return html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)`, "i"))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"))?.[1];
}

function decode(value) {
  return value.replace(/&amp;nbsp;/g, " ").replace(/&amp;#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}
