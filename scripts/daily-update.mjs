import { readFile, writeFile } from "node:fs/promises";
import { CATEGORY, cleanArticle, discoverTrialLinks, extractTrialDay, fetchPage, isCompletedSitting, isDuplicateUpdate, latestIndexedTrialReport, parseStoredUpdates } from "./lib/maltatoday.mjs";

const OUTPUT = new URL("../data/latest.js", import.meta.url);
const apiKey = process.env.OPENAI_API_KEY;
const previousSource = await readFile(OUTPUT, "utf8");
const storedUpdates = parseStoredUpdates(previousSource);
const knownPeople = [
  "Daphne Caruana Galizia", "Yorgen Fenech", "Melvin Theuma", "Keith Schembri",
  "Vince Muscat", "George Degiorgio", "Alfred Degiorgio", "Chris Cardona",
  "Johann Cremona", "Edgar Brincat", "David Gatt", "Keith Arnaud",
  "Adrian Vella", "Lawrence Cutajar", "Nicholas Vella",
  ...storedUpdates.flatMap(update => (update.peopleUpdates || []).map(person => person.name))
];
const mode = process.env.UPDATE_MODE || "completed";
if (mode === "live") {
  const existing = parseLiveUpdate(previousSource);
  const live = await findLiveCoverage();
  if (!live) {
    if (existing) await writeFile(OUTPUT, serialise(storedUpdates, null));
    console.log("No current MaltaToday live trial coverage found; cleared any stale live headline.");
    process.exit(0);
  }
  if (existing?.title === live.title && existing?.sourceUrl === live.sourceUrl) {
    console.log("Current MaltaToday live headline is already published.");
    process.exit(0);
  }
  await writeFile(OUTPUT, serialise(storedUpdates, live));
  console.log(`Published live MaltaToday headline: ${live.title}`);
  process.exit(0);
}
if (!apiKey) console.warn("OPENAI_API_KEY is unavailable; metadata fallback will be used.");
let selected;
const recoverySourceUrl = process.env.UPDATE_SOURCE_URL;
if (recoverySourceUrl) {
  const articleHtml = await fetchPage(recoverySourceUrl);
  const articleText = cleanArticle(articleHtml);
  if (!isCompletedSitting(articleText)) throw new Error(`Recovery source is not a completed sitting: ${recoverySourceUrl}`);
  selected = { sourceUrl: recoverySourceUrl, articleHtml, articleText };
}
try {
  if (!selected) {
    const categoryHtml = await fetchPage(CATEGORY);
    const links = discoverTrialLinks(categoryHtml);
    for (const sourceUrl of links.slice(0, 5)) {
      const articleHtml = await fetchPage(sourceUrl);
      const articleText = cleanArticle(articleHtml);
      if (isCompletedSitting(articleText)) {
        selected = { sourceUrl, articleHtml, articleText };
        break;
      }
    }
  }
} catch (error) {
  console.warn(`Direct MaltaToday retrieval unavailable (${error.message}); checking its indexed headlines.`);
}
if (!selected) {
  const indexed = await latestIndexedTrialReport();
  if (!indexed) {
    console.log("No completed MaltaToday sitting is indexed yet; leaving the site unchanged.");
    process.exit(0);
  }
  if (/^https:\/\/www\.maltatoday\.com\.mt\/news\/court_and_police\/\d+\//i.test(indexed.sourceUrl || "")) {
    try {
      const articleHtml = await fetchPage(indexed.sourceUrl);
      const articleText = cleanArticle(articleHtml);
      if (isCompletedSitting(articleText)) selected = { sourceUrl: indexed.sourceUrl, articleHtml, articleText };
    } catch (error) {
      console.warn(`Indexed MaltaToday report could not be retrieved (${error.message}).`);
    }
  }
  if (!selected) {
    console.log("A MaltaToday headline is indexed, but the completed report could not be verified; leaving the site unchanged.");
    process.exit(0);
  }
}
if (isDuplicateUpdate(storedUpdates, selected)) {
  if (parseLiveUpdate(previousSource)) {
    await writeFile(OUTPUT, serialise(storedUpdates, null));
    console.log("The completed sitting was already recorded; cleared the stale live headline.");
  }
  console.log(`Already recorded ${selected.indexedTitle || selected.sourceUrl}; leaving the site unchanged.`);
  process.exit(0);
}

const previousDay = Math.max(0, ...storedUpdates.map(update => Number(update.day.day) || 0), 25);
const response = selected.indexed || !apiKey ? null : await fetch("https://api.openai.com/v1/responses", {
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
      "Include substantive lower-frequency witnesses and people of interest, not only the central figures; exclude judges, lawyers acting in court and routine procedural references.",
      "For every substantive person in the article who is not in the known-person list, add a peopleUpdates entry with a neutral role and a concise, attributed biography based only on this article.",
      "Every new name used as a relationship endpoint must have a corresponding peopleUpdates entry.",
      "Tone: -1 predominantly adverse/hostile, 0 mixed/neutral, 1 supportive/friendly.",
      "Counts are conservative estimates of distinct substantive mentions in this article.",
      `The next trial day must be greater than ${previousDay}; use the day number explicitly reported by MaltaToday.`
    ].join("\n"),
    input: `Previous recorded day: ${previousDay}\nKnown graph people: ${knownPeople.join(", ")}\nSource URL: ${selected.sourceUrl}\n\nMALTA TODAY ARTICLE:\n${selected.articleText.slice(0, 120000)}`,
    text: { format: { type: "json_schema", name: "trial_daily_update", strict: true, schema: schema() } }
  })
});
let update;
if (response?.ok) {
  const result = await response.json();
  const outputText = result.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
  if (!outputText) throw new Error("OpenAI returned no structured output");
  update = JSON.parse(outputText);
} else {
  const error = response ? await response.json().catch(() => ({})) : {};
  console.warn(`OpenAI unavailable (${response?.status || "no key"}: ${error.error?.code || "unknown"}); using MaltaToday metadata fallback.`);
  update = fallbackUpdate(selected.articleHtml, selected.articleText, selected.sourceUrl, previousDay);
}
update.day.sourceUrl = selected.sourceUrl;
update.peopleUpdates ||= [];
for (const name of new Set(update.relationUpdates.flatMap(relation => [relation.from, relation.to]))) {
  if (!knownPeople.includes(name) && !update.peopleUpdates.some(person => person.name === name)) {
    const relation = update.relationUpdates.find(item => item.from === name || item.to === name);
    update.peopleUpdates.push({
      name,
      role: "person mentioned in evidence",
      bio: `${name} was substantively mentioned in MaltaToday’s report for day ${update.day.day}. ${relation.context}`
    });
  }
}
if (update.day.day <= previousDay) throw new Error(`Generated day ${update.day.day} is not newer than ${previousDay}`);

storedUpdates.push(update);
storedUpdates.sort((a, b) => a.day.day - b.day.day);
await writeFile(OUTPUT, serialise(storedUpdates, null));
console.log(`Updated day ${update.day.day} from ${selected.sourceUrl}`);

function schema() {
  return {
    type: "object", additionalProperties: false, required: ["day", "lead", "peopleUpdates", "relationUpdates"],
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
      peopleUpdates: {
        type: "array", items: {
          type: "object", additionalProperties: false, required: ["name", "role", "bio"],
          properties: { name: { type: "string" }, role: { type: "string" }, bio: { type: "string" } }
        }
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
  const reportedDay = extractTrialDay(sourceUrl, text, previousDay);
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
    peopleUpdates: [],
    relationUpdates: []
  };
}

function matchMeta(html, property) {
  return html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)`, "i"))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"))?.[1];
}

function decode(value) {
  return value.replace(/&amp;nbsp;/g, " ").replace(/&amp;#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&rsquo;|&#8217;/g, "’").replace(/&lsquo;|&#8216;/g, "‘")
    .replace(/&rdquo;|&#8221;/g, "”").replace(/&ldquo;|&#8220;/g, "“")
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

async function findLiveCoverage() {
  try {
    const categoryHtml = await fetchPage(CATEGORY);
    for (const sourceUrl of discoverTrialLinks(categoryHtml).slice(0, 5)) {
      const html = await fetchPage(sourceUrl);
      const title = decode(matchMeta(html, "og:title") || "").replace(/\s+/g, " ").trim();
      if (/^LIVE\b/i.test(title)) return { title, sourceUrl, date: maltaDate() };
    }
  } catch (error) {
    console.warn(`Direct MaltaToday live retrieval unavailable (${error.message}); checking its indexed headline.`);
  }
  const indexed = await latestIndexedTrialReport(new Date(), true);
  if (!indexed) return null;
  const title = /^LIVE\b/i.test(indexed.title) ? indexed.title : `LIVE | ${indexed.title}`;
  return { title, sourceUrl: indexed.sourceUrl || CATEGORY, date: maltaDate() };
}

function parseLiveUpdate(source) {
  const match = source.match(/window\.LIVE_UPDATE\s*=\s*([^;]+);/);
  return match ? JSON.parse(match[1]) : null;
}

function serialise(updates, live) {
  return `window.LIVE_UPDATE = ${JSON.stringify(live, null, 2)};\nwindow.DAILY_UPDATES = ${JSON.stringify(updates, null, 2)};\n`;
}

function maltaDate() {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Malta" }).format(new Date());
}
