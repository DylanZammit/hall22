import { readFile, writeFile } from "node:fs/promises";

const CATEGORY = "https://www.maltatoday.com.mt/news/court_and_police";
const OUTPUT = new URL("../data/latest.js", import.meta.url);
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Set OPENAI_API_KEY before running npm run update");

const categoryHtml = await fetch(CATEGORY).then(check).then(r => r.text());
const links = [...categoryHtml.matchAll(/href=["']([^"']*\/news\/court_and_police\/\d+\/[^"']*(?:yorgen|fenech)[^"']*)["']/gi)]
  .map(match => new URL(match[1], CATEGORY).href)
  .filter((url, index, all) => all.indexOf(url) === index)
  .sort((a, b) => articleId(b) - articleId(a));
if (!links.length) throw new Error("No current Yorgen Fenech trial article found on MaltaToday");

const sourceUrl = links[0];
const articleHtml = await fetch(sourceUrl).then(check).then(r => r.text());
const articleText = clean(articleHtml).slice(0, 120000);
const previous = await readFile(OUTPUT, "utf8");
const previousDay = Number(previous.match(/day:\s*(\d+)/)?.[1] || 0);

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
      "Counts are conservative estimates of distinct substantive mentions in this article."
    ].join("\n"),
    input: `Previous recorded day: ${previousDay}\nSource URL: ${sourceUrl}\n\nMALTA TODAY ARTICLE:\n${articleText}`,
    text: {
      format: {
        type: "json_schema",
        name: "trial_daily_update",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["day", "lead", "relationUpdates"],
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
              type: "object", additionalProperties: false,
              required: ["label", "title", "summary"],
              properties: { label: { type: "string" }, title: { type: "string" }, summary: { type: "string" } }
            },
            relationUpdates: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["from", "to", "count", "tone", "context", "days"],
                properties: {
                  from: { type: "string" }, to: { type: "string" },
                  count: { type: "integer", minimum: 1 }, tone: { type: "integer", minimum: -1, maximum: 1 },
                  context: { type: "string" }, days: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  })
}).then(check).then(r => r.json());

const outputText = response.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
if (!outputText) throw new Error("OpenAI returned no structured output");
const update = JSON.parse(outputText);
update.day.sourceUrl = sourceUrl;
await writeFile(OUTPUT, `window.DAILY_UPDATE = ${JSON.stringify(update, null, 2)};\n`);
console.log(`Updated day ${update.day.day} from ${sourceUrl}`);

function check(response) {
  if (!response.ok) throw new Error(`${response.url}: HTTP ${response.status}`);
  return response;
}
function articleId(url) { return Number(url.match(/court_and_police\/(\d+)/)?.[1] || 0); }
function clean(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();
}
