import { test, expect } from '@playwright/test';
import { PAGES } from './support/pages';

// Regression guard for the DRY-up of contact details: the email address,
// phone number, opening hours and address all come from a single source
// (src/site.config.mjs) and are substituted in at build time. These specs
// check the substitution actually happened correctly on every page — not
// just on the homepage where the details were originally hand-written.
for (const { path } of PAGES) {
  test(`${path} has no leftover {{TOKEN}} placeholders`, async ({ page }) => {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });
}

test('the homepage shows the correct email and phone number, with working mailto/tel links', async ({ page }) => {
  await page.goto('/index.html');

  const mailtoLinks = page.locator('a[href="mailto:info@kingtonfoodbank.org.uk"]');
  await expect(mailtoLinks.first()).toBeVisible();
  await expect(mailtoLinks).toHaveText(['info@kingtonfoodbank.org.uk', 'info@kingtonfoodbank.org.uk']);

  const telLinks = page.locator('a[href="tel:+447794439644"]');
  await expect(telLinks.first()).toBeVisible();
  await expect(telLinks).toHaveText(['07794 439644', '07794 439644']);
});

test('the homepage shows consistent opening hours and address in the hero and the footer', async ({ page }) => {
  await page.goto('/index.html');

  await expect(page.locator('.notice .day')).toHaveText(/Fridays/);
  await expect(page.locator('.notice .time')).toHaveText('11:30 – 13:30');
  await expect(page.locator('.notice .place')).toContainText('Parish Hall, Church Road, Kington, Herefordshire HR5 3AG');

  await expect(page.locator('footer.site')).toContainText('Fridays');
  await expect(page.locator('footer.site')).toContainText('11:30am – 1:30pm');
  await expect(page.locator('footer.site')).toContainText('Parish Hall, Church Road');
});
