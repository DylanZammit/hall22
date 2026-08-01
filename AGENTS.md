# Hall 22 — Instructions for AI collaborators

These instructions apply to the entire repository.

## Project summary

Hall 22 is an independent, interactive digest of MaltaToday’s reporting on the jury trial of Yorgen Fenech concerning the assassination of Daphne Caruana Galizia. It is a static website hosted with GitHub Pages.

The site provides:

- a prominent current lead, showing either MaltaToday’s live morning headline or the latest completed sitting;
- a searchable and filterable timeline of trial proceedings;
- a directed relationship graph showing who mentioned whom;
- person profiles, connection context and MaltaToday source links;
- an explanation of the methodology, editorial qualifications and source limitations.

MaltaToday is the project’s sole factual source. Yorgen Fenech has pleaded not guilty. Testimony, allegations and disputed claims must always remain clearly attributed and must never be presented as findings of fact.

## Repository structure

- `index.html` contains the page structure and static editorial copy.
- `styles.css` contains the responsive visual design.
- `app.js` contains the historical baseline, timeline search, graph data and browser rendering logic.
- `data/latest.js` contains automatically generated live and completed-sitting updates.
- `scripts/daily-update.mjs` orchestrates MaltaToday extraction and structured updates.
- `scripts/lib/maltatoday.mjs` contains retrieval, parsing and fallback utilities.
- `test/maltatoday.test.mjs` tests retrieval and parsing helpers.
- `.github/workflows/daily-update.yml` runs the scheduled MaltaToday updater.
- `.github/workflows/pages.yml` validates and deploys the static site to GitHub Pages.
- `README.md` contains the fuller architecture, data model and operating guide.

## Required development and approval workflow

For every requested local code, content, design or configuration change other than the scheduled daily data update:

1. Start from the latest production branch and create a new, purpose-specific branch before editing.
2. Make changes only on that branch.
3. Preserve unrelated user work and never commit secrets or `.env` files.
4. Run `npm run check` and any additional checks appropriate to the change.
5. Host the changed site locally with `npm start` or an equivalent static server.
6. Give the user the local preview URL, normally `http://localhost:4173`, and summarise what is ready to review.
7. Stop and wait for the user’s explicit approval. Do not push the branch, open a pull request, merge, or deploy before that approval.
8. Once the user gives the go-ahead, commit and push the approved branch, open a pull request targeting the production/default branch (`master`), merge it, and verify the GitHub Pages deployment.

The repository currently uses `master` as its production/default branch. If the user informally says “main,” interpret that as the production/default branch unless they explicitly request a branch rename.

Do not bypass the preview-and-approval gate merely because a change appears small, safe or obvious. If the local server cannot be reached by the user, explain the limitation and agree on another preview method before opening a PR.

## Exception: scheduled daily GitHub Actions updates

The approval workflow above does not apply to the existing automated daily MaltaToday data updates.

The scheduled updater must remain autonomous:

- At 10am Europe/Malta time it may publish MaltaToday’s current live headline and source link.
- At 8pm Europe/Malta time it may append a completed-sitting update.
- It may update `data/latest.js`, validate the result, commit as the update bot, push to `master`, and trigger GitHub Pages without manual approval.
- Duplicate or unfinished sittings must not be added.
- Headline-only fallbacks must not invent relationship data.

Do not change, disable or add an approval gate to this daily automation unless the user explicitly requests it.

## Editorial and data rules

- Use only MaltaToday as a factual source for the trial content.
- Preserve attribution for testimony, allegations and defence or prosecution claims.
- Never infer guilt, credibility or a finding of fact.
- Keep relationship edges directed: speaker or account → person mentioned.
- Treat edge colour as the context of a reported mention, not a real-world personal relationship.
- Treat mention counts conservatively and identify the relevant source days.
- Keep all historical daily updates; never overwrite the update history with only the newest day.
- Do not derive relationship changes from a headline alone.

## Security and deployment

- Never commit `.env`, API keys, private keys, certificates or other secrets.
- The OpenAI key belongs only in the local environment or GitHub Actions secrets.
- The site must remain a static deployment compatible with GitHub Pages unless the user explicitly approves an architectural change.
- Use relative asset paths so both local previews and the custom domain work.
- Validate production after an approved merge, including the custom domain and GitHub Pages workflow.
