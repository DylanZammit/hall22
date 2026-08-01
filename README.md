# Hall 22

Hall 22 is an independent, interactive digest of MaltaToday’s reporting on the jury trial of Yorgen Fenech concerning the assassination of Daphne Caruana Galizia.

The published site is [dylanzammit.github.io/hall22](https://dylanzammit.github.io/hall22/). It is a static website: no application server or database is required.

> Fenech has pleaded not guilty. Testimony and allegations shown by the site are not findings of fact. MaltaToday is the project’s sole factual source.

## What the site contains

- A current lead showing either MaltaToday’s morning live headline or the latest completed-sitting summary.
- A searchable and category-filterable timeline of proceedings.
- A directed relationship graph showing who mentioned whom.
- Person profiles and contextual descriptions for graph connections.
- Direct links to the relevant MaltaToday coverage.

Timeline search checks daily titles, summaries, takeaways, source titles, people and relationship descriptions. Graph arrows point from the speaker or account to the person mentioned. Line colour encodes editorially classified context, line thickness encodes the connection’s mention band, and circle size encodes total mapped mentions.

## Architecture

```text
hall22/
├── index.html                       Page structure and static editorial copy
├── styles.css                      Responsive layout and visual design
├── app.js                          Timeline, search, graph and rendering logic
├── data/
│   └── latest.js                   Persistent generated updates and live lead
├── scripts/
│   ├── daily-update.mjs            Daily update orchestrator
│   └── lib/maltatoday.mjs          Retrieval, parsing and fallback utilities
├── test/
│   └── maltatoday.test.mjs         Node test suite for retrieval helpers
├── .github/workflows/
│   ├── daily-update.yml            Scheduled MaltaToday extraction and commit
│   └── pages.yml                   GitHub Pages validation and deployment
├── .nojekyll                       Serves the repository as a plain static site
├── .gitignore                      Excludes secrets, keys and local files
└── package.json                    Local commands; no runtime dependencies
```

The browser loads the files in this order:

1. `index.html` creates the document structure.
2. `styles.css` supplies desktop and mobile presentation.
3. `data/latest.js` defines `window.LIVE_UPDATE` and `window.DAILY_UPDATES`.
4. `app.js` merges generated updates into the editorial baseline, then renders the timeline, search results, sources and SVG graph.

Because everything delivered to the browser is static, GitHub Pages can host it for free and no secret is exposed to visitors.

## Update pipeline

The scheduled workflow uses Malta local time while GitHub cron operates in UTC.

### 10am: current live coverage

At 10am Europe/Malta time, the updater looks for a same-day MaltaToday trial headline beginning with `LIVE`. When found, it writes the exact headline and MaltaToday link to `window.LIVE_UPDATE`. It does not create a completed timeline day or relationship data from an unfinished sitting.

### 8pm: completed sitting

At 8pm Europe/Malta time, the updater looks for an article containing a clear conclusion marker. A completed report is converted into a structured daily entry and appended to `window.DAILY_UPDATES`; prior entries are preserved and duplicates are ignored. A completed update also clears the temporary live lead.

The workflow retries during each scheduled hour so a report published slightly late can still be captured. When `data/latest.js` changes, the workflow commits and pushes it to `master`. That push triggers the Pages workflow, which validates and deploys the site.

## Retrieval and fallback behaviour

The updater first requests MaltaToday directly with browser-like headers and retries. It can also use a Google Translate relay because MaltaToday may return HTTP 403 to GitHub-hosted runners. If full-page retrieval remains unavailable, it checks Google News’ index for a same-day MaltaToday headline.

When full article text and a working OpenAI API key are available, the updater requests schema-constrained output for the summary and relationship changes. If the API is unavailable or out of quota, it uses conservative MaltaToday metadata instead. Headline-only fallbacks never invent graph relationships.

## Local development

Requirements:

- Node.js 22 or newer for validation and updates.
- Python 3 for the included lightweight local web server.

Run the site locally:

```sh
npm start
```

Then open [http://localhost:4173](http://localhost:4173).

Validate JavaScript and run the tests:

```sh
npm run check
```

Run the completed-sitting updater manually:

```sh
UPDATE_MODE=completed npm run update
```

Run the morning live-headline updater manually:

```sh
UPDATE_MODE=live npm run update
```

For richer completed-sitting summaries, put the API key in a local `.env` file and export it before running the command. Node does not automatically load `.env` in this project.

```sh
set -a
source .env
set +a
UPDATE_MODE=completed npm run update
```

Never add `.env` or an API key to Git. The repository’s `.gitignore` excludes `.env`, private keys and certificates.

## GitHub configuration

The scheduled updater needs these repository settings:

- Actions workflow permissions set to allow read and write access.
- An `OPENAI_API_KEY` Actions secret if AI-generated structured summaries are desired. The fallback works without it.
- GitHub Pages configured to deploy through GitHub Actions.

Every push to `master` runs `.github/workflows/pages.yml`. It executes `npm run check`, uploads the static files and publishes them to GitHub Pages.

## Data model

`data/latest.js` deliberately uses JavaScript globals rather than fetched JSON so the site also works without a build step or cross-origin requests.

```js
window.LIVE_UPDATE = {
  title: "LIVE | …",
  sourceUrl: "https://www.maltatoday.com.mt/…",
  date: "1 August 2026"
};

window.DAILY_UPDATES = [
  {
    day: { day, date, type, title, summary, points, sourceTitle, sourceUrl },
    lead: { label, title, summary },
    peopleUpdates: [{ name, role, bio }],
    relationUpdates: [{ from, to, count, tone, context, days }]
  }
];
```

Relationship `tone` is `-1` for predominantly adverse context, `0` for mixed or neutral context, and `1` for supportive context. It describes the reported mention, not the people’s real-world personal relationship.

Completed updates also extract profiles for substantive witnesses or people of interest who are not already in the graph. The browser merges these profiles into the network, gives them positions automatically and sizes their circles from their mapped mention totals. An unseen relationship endpoint is rendered with a conservative fallback profile rather than breaking the graph. Court officials and routine procedural references remain excluded.

## Editorial maintenance

The historical baseline, people and initial graph relationships currently live in `app.js`. Automatically generated additions live in `data/latest.js`. When adding or correcting a relationship manually:

- preserve its direction: speaker/account → person mentioned;
- use a conservative distinct-mention count;
- identify the relevant source day;
- describe allegations as allegations;
- rely only on MaltaToday reporting.

For additional hosting and local scheduler notes, see [UPDATE_AND_HOSTING.md](UPDATE_AND_HOSTING.md).

## Credits

Built by [Dylan Zammit](https://www.linkedin.com/in/dylanzam/) · [GitHub](https://github.com/DylanZammit)

Hall 22 is not affiliated with MaltaToday or the Courts of Malta.
