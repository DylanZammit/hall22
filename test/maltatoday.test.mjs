import test from "node:test";
import assert from "node:assert/strict";
import { cleanArticle, discoverTrialLinks, extractTrialDay, isCompletedSitting, isDuplicateUpdate, parseStoredUpdates, toTranslateRelay } from "../scripts/lib/maltatoday.mjs";

test("discovers, normalises and sorts MaltaToday trial links", () => {
  const html = `
    <a href="/news/court_and_police/143521/yorgen_fenech_trial1">old</a>
    <a href="https://www.maltatoday.com.mt/news/court_and_police/143541/yorgen_fenech_day_27">new</a>`;
  assert.deepEqual(discoverTrialLinks(html), [
    "https://www.maltatoday.com.mt/news/court_and_police/143541/yorgen_fenech_day_27",
    "https://www.maltatoday.com.mt/news/court_and_police/143521/yorgen_fenech_trial"
  ]);
});

test("normalises translated MaltaToday links back to the canonical source", () => {
  const html = `<a href="https://www-maltatoday-com-mt.translate.goog/news/court_and_police/143541/yorgen_fenech_day_27?_x_tr_sl=auto&amp;_x_tr_tl=en">story</a>`;
  assert.deepEqual(discoverTrialLinks(html), [
    "https://www.maltatoday.com.mt/news/court_and_police/143541/yorgen_fenech_day_27"
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

test("deduplicates indexed reports by headline rather than the shared category URL", () => {
  const stored = [{ day: { sourceTitle: "Day 27 report", sourceUrl: "https://www.maltatoday.com.mt/news/court_and_police" } }];
  assert.equal(isDuplicateUpdate(stored, {
    indexed: true,
    indexedTitle: "Day 28 report",
    sourceUrl: "https://www.maltatoday.com.mt/news/court_and_police"
  }), false);
  assert.equal(isDuplicateUpdate(stored, {
    indexed: true,
    indexedTitle: "Day 27 report",
    sourceUrl: "https://www.maltatoday.com.mt/news/court_and_police"
  }), true);
});

test("extracts an ordinal trial day from MaltaToday URLs before stale article text", () => {
  assert.equal(extractTrialDay(
    "https://www.maltatoday.com.mt/news/court_and_police/143553/yorgen_fenech_trial_enters_28th_day_as_jury_hearing_continues_2",
    "A related link says the trial entered its 27th day.",
    27
  ), 28);
});

test("builds a same-path Google Translate relay URL for MaltaToday", () => {
  const relay = new URL(toTranslateRelay("https://www.maltatoday.com.mt/news/court_and_police?x=1"));
  assert.equal(relay.hostname, "www-maltatoday-com-mt.translate.goog");
  assert.equal(relay.pathname, "/news/court_and_police");
  assert.equal(relay.searchParams.get("x"), "1");
  assert.equal(relay.searchParams.get("_x_tr_tl"), "en");
});
