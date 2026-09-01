import { test, expect } from './support/fixtures';
import { PAGES } from './support/pages';

for (const { path } of PAGES) {
  test(`${path} shows a build number in the footer`, async ({ page }) => {
    await page.goto(path);

    const buildNumber = page.locator('footer.site .build-number');
    await expect(buildNumber).toBeVisible();
    await expect(buildNumber).toHaveText(/^Build \d{4}\.\d{2}\.\d{2}\.\d{3}$/);
  });

  test(`${path} credits mediawright.uk in the footer`, async ({ page }) => {
    await page.goto(path);

    const credit = page.locator('footer.site .fine a[href="https://mediawright.uk"]');
    await expect(credit).toBeVisible();
    await expect(credit).toHaveText('mediawright.uk');
  });
}
