// Every spec should import `test`/`expect` from here instead of directly
// from '@playwright/test'. The only difference: this blocks every request
// that isn't to our own static-server (Google Fonts, the homepage's Google
// Maps iframe) before it leaves the page. No spec asserts on webfont
// rendering or live map tiles, so this doesn't drop any coverage — it
// removes the suite's only source of real network I/O, which can cause
// occasional multi-second stalls on an otherwise-arbitrary test whenever
// that request is slow to resolve from wherever CI happens to run.
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
    await use(page);
  },
});

export { expect };
