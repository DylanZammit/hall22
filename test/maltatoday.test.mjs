import test from "node:test";
import assert from "node:assert/strict";
import { cleanArticle, discoverTrialLinks, isCompletedSitting, parseStoredUpdates, toTranslateRelay } from "../scripts/lib/maltatoday.mjs";

test("discovers, normalises and sorts MaltaToday trial links", () => {
  const html = `
    <a href="/news/court_and_police/143521/yorgen_fenech_trial1">old</a>
    <a href="https://www.maltatoday.com.mt/news/court_and_police/143541/yorgen_fenech_day_27">new</a>`;
  assert.deepEqual(discoverTrialLinks(html), [
    "https://www.maltatoday.com.mt/news/court_and_police/143541/yorgen_fenech_day_27",
    "https://www.maltatoday.com.mt/news/court_and_police/143521/yorgen_fenech_trial"
  ]);
});

test("recognises a completed sitting after cleaning HTML", () => {
  const text = cleanArticle("<script>ignore()</script><p>That concludes today’s sitting.</p>");
  assert.equal(text, "That concludes today’s sitting.");
  assert.equal(isCompletedSitting(text), true);
  assert.equal(isCompletedSitting("Proceedings will continue this afternoon"), false);
});

test("parses the persistent update history", () => {
  const updates = parseStoredUpdates('window.DAILY_UPDATES = [{"day":{"day":26}}];\n');
  assert.equal(updates[0].day.day, 26);
});

test("builds a same-path Google Translate relay URL for MaltaToday", () => {
  const relay = new URL(toTranslateRelay("https://www.maltatoday.com.mt/news/court_and_police?x=1"));
  assert.equal(relay.hostname, "www-maltatoday-com-mt.translate.goog");
  assert.equal(relay.pathname, "/news/court_and_police");
  assert.equal(relay.searchParams.get("x"), "1");
  assert.equal(relay.searchParams.get("_x_tr_tl"), "en");
});
