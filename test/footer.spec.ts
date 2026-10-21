import { test, expect } from './support/fixtures';
import { PAGES } from './support/pages';

// The build number lives only on /updates.html, not in every page's footer:
// stamping it sitewide meant every commit rewrote every page in public/.
test('/updates.html shows the current build number', async ({ page }) => {
  await page.goto('/updates.html');

  const buildNumber = page.locator('.section-head .build-number');
  await expect(buildNumber).toBeVisible();
  await expect(buildNumber).toHaveText(/^Current build: \d{4}\.\d{2}\.\d{2}\.\d{3}$/);
});

for (const { path } of PAGES) {
  test(`${path} has no build number in the footer`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('footer.site .build-number')).toHaveCount(0);
  });

  test(`${path} credits mediawright.uk in the footer`, async ({ page }) => {
    await page.goto(path);

    const credit = page.locator('footer.site .fine a[href="https://mediawright.uk"]');
    await expect(credit).toBeVisible();
    await expect(credit).toHaveText('mediawright.uk');
  });
}
