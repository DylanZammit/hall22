export const CATEGORY = "https://www.maltatoday.com.mt/news/court_and_police";

const BROWSER_HEADERS = {
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-GB,en;q=0.9",
  "cache-control": "no-cache"
};

export async function fetchPage(url, attempts = 3) {
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

export function discoverTrialLinks(html, baseUrl = CATEGORY) {
  return [...html.matchAll(/href=["']([^"']*\/news\/court_and_police\/\d+\/[^"']*(?:yorgen|fenech)[^"']*)["']/gi)]
    .map(match => new URL(match[1], baseUrl).href.replace(/1$/, ""))
    .filter((url, index, all) => all.indexOf(url) === index)
    .sort((a, b) => articleId(b) - articleId(a));
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
  return /(sitting|session|proceedings|court)\s+(?:is\s+)?(?:concludes?|wraps? up|ends?|adjourned)|that concludes|thanks for following/i.test(text);
}

export function parseStoredUpdates(source) {
  const match = source.match(/window\.DAILY_UPDATES\s*=\s*([\s\S]*);\s*$/);
  if (!match) throw new Error("data/latest.js does not contain DAILY_UPDATES");
  const parsed = JSON.parse(match[1]);
  if (!Array.isArray(parsed)) throw new Error("DAILY_UPDATES must be an array");
  return parsed;
}
