# Kington Foodbank

Static site for Kington Foodbank, live at [kingtonfoodbank.org.uk](https://kingtonfoodbank.org.uk) (Cloudflare Workers, auto-deploys on push to `main`). Same lightweight build pipeline as [wrightmaths.uk](https://github.com/magicobject/WrightMaths) and [mediawright.uk](https://github.com/magicobject/MediaWright) — see their READMEs for the full explanation; the short version is below.

## Quick start

```bash
npm install       # also wires up the pre-commit hook — see below
npm run build     # generate public/*.html from templates/ + src/
npm run serve     # serve public/ locally at http://localhost:4174
npm test          # run the Playwright suite
```

## How the build works

This is a one-page site: everything lives on `index.html`, with the main nav linking to sections on that same page (`#help`, `#donate`, `#volunteer`, `#contact`), plus a standalone `404` page. Neither is written by hand as a full HTML file — each is assembled from four pieces by [scripts/build.mjs](scripts/build.mjs):

1. **[templates/header.html](templates/header.html)**, **[templates/footer.html](templates/footer.html)**, **[templates/page.html](templates/page.html)** — the shared page shell (nav, footer, `<head>`) with `{{PLACEHOLDER}}` tokens. The 404 page opts out of the header (it isn't a nav destination) but still gets the shared footer.
2. **[src/pages/\*.html](src/pages)** — just the content unique to each page. No `<head>`, no header, no footer — the build script wraps that around it.
3. **[src/pages.config.mjs](src/pages.config.mjs)** — the nav links and each page's `<title>`/meta description/robots behaviour.
4. **[src/site.config.mjs](src/site.config.mjs)** — the single source of truth for contact details: email, phone, opening hours, address, and the MediaWright credit. Every `camelCase` key becomes an `{{UPPER_SNAKE_CASE}}` token (e.g. `phoneDisplay` → `{{PHONE_DISPLAY}}`), substituted wherever it appears — in the templates *and* in `src/pages/*.html` content. That's what makes this DRY: the phone number is typed once, in one file, and shows up correctly on the hero, the donate section, the footer and the 404 page alike.

Running `npm run build` reads all four and writes the finished files into `public/`, which is what Cloudflare actually serves (`wrangler.jsonc` points `assets.directory` at `./public`).

## What to edit, and what never to touch

| Want to change... | Edit this | Never edit this |
|---|---|---|
| Email, phone, opening hours, address | `src/site.config.mjs` | Any hard-coded string in `src/pages/` or `templates/` |
| Page content (wording, sections) | `src/pages/<page>.html` | `public/<page>.html` |
| Nav links, page title/description | `src/pages.config.mjs` | `public/<page>.html` |
| Header/footer, shared `<head>` | `templates/*.html` | `public/<page>.html` |
| Styling | `public/css/style.css` (this one genuinely lives in `public/` — it isn't generated) | — |
| Favicons | `public/favicon*.png`, `public/apple-touch-icon.png` (also not generated) | — |

**`public/*.html` is a build artefact.** Every one of those files opens with an auto-generated `DO-NOT-EDIT` HTML comment banner for exactly this reason: a hand-edit made directly to a file in `public/` will be **silently overwritten** the next time anyone runs `npm run build` — which happens automatically on every commit (see below).

If you're not sure whether a file in `public/` is generated or hand-maintained, check whether it has a same-named counterpart under `src/pages/` — if it does, it's generated.

## The pre-commit hook and the build number in the footer

Every page's footer shows a build number like `Build 2026.08.29.003` (format `yyyy.mm.dd.NNN`, where `NNN` counts commits made that day, stored in [build-number.json](build-number.json)).

This is maintained automatically, not by hand. `npm install` runs the `prepare` script, which points git at the tracked [.githooks/pre-commit](.githooks/pre-commit) hook. On every commit, that hook:

1. Runs [scripts/bump-build-number.mjs](scripts/bump-build-number.mjs), which increments today's counter in `build-number.json`.
2. Runs `npm run build`, regenerating every file in `public/` — including stamping the new build number into each footer and cache-busting `css/style.css?v=...`.
3. Stages the results (`git add public build-number.json`) so they're included in the commit you're about to make.

In other words: **you never bump the build number or rebuild `public/` yourself** — just edit source files under `src/`/`templates/` and commit as normal.

## Build tags and the /updates changelog

Every commit gets a matching git tag, `build-<date>.<NNN>` (e.g. `build-2026.08.31.001`) — the same value as the footer's "Build ..." text for that commit, so any deployed build is checkoutable by name (`git checkout build-2026.08.31.001`) without digging through `git log`.

[src/pages/updates.html](src/pages/updates.html) (served at `/updates.html`) is a hand-maintained changelog, one entry per build number, newest first — the human-readable counterpart to the git tags. It's a real page, built by the normal pipeline like any other, but it's deliberately not linked from anywhere on the site (this site's `NAV` is all in-page anchors on the homepage, so it wouldn't make sense there anyway — `header: false` in `src/pages.config.mjs`, same as 404), and is `robots: noindex` — a build log for whoever knows the URL, not user-facing content.

## Accessibility

Both pages are scanned with [axe-core](https://github.com/dequelabs/axe-core) (via `@axe-core/playwright`) in [test/accessibility.spec.ts](test/accessibility.spec.ts) — part of `npm test`, so a real regression fails the suite, not just a one-off manual check.

One gotcha worth knowing if this ever needs re-running by hand: the reveal-on-scroll animation (`.reveal` / the inline scroll script) means elements below the fold are still at `opacity: 0` — or mid-transition — when a scan runs immediately after `page.goto()`. Axe reads that as a real color-contrast failure, which it isn't. The spec force-settles every `.reveal` element (adds the `.in` class *and* kills the transition outright, since toggling the class alone just starts a fresh animation rather than jumping to the end state) before scanning, so it tests the real final state a visitor actually sees.

Fixes that came out of the last full pass:

- **A map embed with no accessible name, and an invalid ARIA attribute next to it.** The `<iframe>` showing the Google Maps embed had no `title`, so screen readers announce it as nothing in particular. Its wrapping `<div>` had `aria-label="Map showing Parish Hall"` instead — invalid, since `aria-label` isn't permitted on a plain `<div>` with no ARIA role. Moved the label to where it actually belongs: `title="Map showing Parish Hall, Kington"` on the `<iframe>` itself, and dropped the now-redundant `aria-label` from the wrapper.
- **404 had no `<main>` landmark at all** — its content sat in a bare `<section>`, so every bit of it (heading, body text, buttons) was flagged as not contained by any landmark. Now `<main class="hero notfound">`.
- **Footer heading levels.** "Kington Foodbank" / "Opening hours" / "Get in touch" were real `<h4>`s, which skips a level on both pages here (their last real heading is an `<h1>`, with nothing in between). They're group labels, not part of the content outline, so they're `<p class="foot-heading">` now — identical styling, no heading semantics.
- **One real color-contrast failure:** the footer's muted copyright/build-number text only hit 4.25:1 against the dark footer background (needs 4.5:1) — lightened slightly to comfortably clear it.

## Tests

[Playwright](https://playwright.dev) specs in `test/` cover:

- **[contact-details.spec.ts](test/contact-details.spec.ts)** — the point of the DRY-up: checks the email, phone, opening hours and address actually got substituted correctly (and that no `{{TOKEN}}` placeholder was ever left un-replaced) on every generated page.
- **[footer.spec.ts](test/footer.spec.ts)** — every page shows a correctly-formatted build number and the "Site by mediawright.uk" credit.
- **[homepage.spec.ts](test/homepage.spec.ts)** — the homepage loads with its nav and all four sections present.
- **[not-found.spec.ts](test/not-found.spec.ts)** — unknown URLs get a real 404 status and the branded 404 page, which is `noindex`, has no main nav, and still shows correct contact details.
- **[accessibility.spec.ts](test/accessibility.spec.ts)** — an axe-core scan of every page with zero tolerated violations (see "Accessibility" above for what that's already caught and how the reveal-on-scroll animation is worked around).

`test/support/pages.ts` is the shared list of generated pages used across specs; add an entry there when adding a new page.

## Deployment

Push to `main` — Cloudflare picks up the change and deploys `public/` automatically. There's no separate deploy step to run locally.

**Cloudflare setup still needed:** `wrangler.jsonc` now points `assets.directory` at `./public` instead of the repo root, since assets moved there as part of this restructure. If the Worker was previously configured to serve from the repo root, redeploy (or check the dashboard) after this change lands to make sure it picks up the new directory.
