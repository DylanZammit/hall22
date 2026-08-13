export const CATEGORY = "https://www.maltatoday.com.mt/news/court_and_police";

const BROWSER_HEADERS = {
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-GB,en;q=0.9",
  "cache-control": "no-cache"
};

export async function fetchPage(url, attempts = 3) {
  try {
    return await fetchWithRetries(url, attempts);
  } catch (directError) {
    const relayUrl = toTranslateRelay(url);
    try {
      return await fetchWithRetries(relayUrl, 2);
    } catch (relayError) {
      throw new AggregateError([directError, relayError], `Unable to retrieve MaltaToday URL ${url}`);
    }
  }
}

async function fetchWithRetries(url, attempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
      if (response.ok) return response.text();
      lastError = new Error(`${response.url}: HTTP ${response.status}`);
      if (![403, 429, 500, 502, 503, 504].includes(response.status)) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
  }
  throw lastError;
}

export function toTranslateRelay(url) {
  const source = new URL(url);
  if (source.hostname !== "www.maltatoday.com.mt") return source.href;
  source.hostname = "www-maltatoday-com-mt.translate.goog";
  source.searchParams.set("_x_tr_sl", "auto");
  source.searchParams.set("_x_tr_tl", "en");
  source.searchParams.set("_x_tr_hl", "en");
  return source.href;
}

export function discoverTrialLinks(html, baseUrl = CATEGORY) {
  return [...html.matchAll(/href=["']([^"']*\/news\/court_and_police\/\d+\/[^"']*(?:yorgen|fenech)[^"']*)["']/gi)]
    .map(match => normaliseArticleUrl(new URL(match[1].replace(/&amp;/g, "&"), baseUrl)))
    .filter((url, index, all) => all.indexOf(url) === index)
    .sort((a, b) => articleId(b) - articleId(a));
}

function normaliseArticleUrl(url) {
  if (url.hostname === "www-maltatoday-com-mt.translate.goog") url.hostname = "www.maltatoday.com.mt";
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/1$/, "");
  return url.href;
}

export function articleId(url) {
  return Number(url.match(/court_and_police\/(\d+)/)?.[1] || 0);
}

export function cleanArticle(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();
}

export function isCompletedSitting(text) {
  return /(sitting|session|proceedings|court|trial)\s+(?:is\s+)?(?:concludes?|wraps? up|ends?|over|adjourned)|the day concluded|that concludes|thanks for following/i.test(text);
}

export function parseStoredUpdates(source) {
  const match = source.match(/window\.DAILY_UPDATES\s*=\s*([\s\S]*);\s*$/);
  if (!match) throw new Error("data/latest.js does not contain DAILY_UPDATES");
  const parsed = JSON.parse(match[1]);
  if (!Array.isArray(parsed)) throw new Error("DAILY_UPDATES must be an array");
  return parsed;
}

export function isDuplicateUpdate(storedUpdates, selected) {
  if (selected.indexed) {
    return storedUpdates.some(update => update.day.sourceTitle === selected.indexedTitle);
  }
  return storedUpdates.some(update => update.day.sourceUrl === selected.sourceUrl);
}

export function extractTrialDay(sourceUrl, articleText, previousDay) {
  const urlDay = sourceUrl.match(/(?:day[_-]?(\d+)|(\d+)(?:st|nd|rd|th)?[_-]+day)/i);
  if (urlDay) return Number(urlDay[1] || urlDay[2]);
  const textDay = articleText.match(/(?:enters?|day)\s+(?:its\s+)?(\d+)(?:st|nd|rd|th)?\s+day/i);
  return Number(textDay?.[1] || previousDay + 1);
}

export async function latestIndexedTrialReport(now = new Date(), liveOnly = false) {
  const query = encodeURIComponent("site:maltatoday.com.mt/news/court_and_police Yorgen Fenech trial when:2d");
  const url = `https://news.google.com/rss/search?q=${query}&hl=en&gl=MT&ceid=MT:en`;
  const xml = await fetchWithRetries(url, 2);
  const localDate = dateKey(now);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => {
    const item = match[1];
    const title = decodeXml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+-\s+MaltaToday$/i, "");
    const published = new Date(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || 0);
    const indexedUrl = decodeXml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "");
    return { title, published, indexedUrl };
  }).filter(item =>
    /Yorgen Fenech/i.test(item.title) && /trial|jury/i.test(item.title) && dateKey(item.published) === localDate
  );
  const candidates = items.filter(item => isTrialProceedingsHeadline(item.title));
  candidates.sort((a, b) => b.published - a.published);
  const selected = candidates[0];
  if (!selected) return null;
  selected.sourceUrl = await resolveIndexedSourceUrl(selected.title).catch(() => null) || selected.indexedUrl;
  return selected;
}

export function isTrialProceedingsHeadline(title) {
  return /Yorgen Fenech/i.test(title) && /trial|jury/i.test(title)
    && !/sketch|through the eyes|analysis|explainer|profile/i.test(title);
}

export function extractDuckDuckGoSourceUrl(html) {
  for (const match of html.matchAll(/[?&]uddg=([^&"']+)/g)) {
    const candidate = decodeURIComponent(match[1]);
    if (/^https:\/\/www\.maltatoday\.com\.mt\/news\/court_and_police\/\d+\//i.test(candidate)) return candidate;
  }
  return null;
}

async function resolveIndexedSourceUrl(title) {
  const query = encodeURIComponent(`site:maltatoday.com.mt/news/court_and_police/ "${title}"`);
  const html = await fetchWithRetries(`https://html.duckduckgo.com/html/?q=${query}`, 2);
  return extractDuckDuckGoSourceUrl(html);
}

function dateKey(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Malta", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function decodeXml(value) {
  return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
