import { test, expect } from './support/fixtures';

test('an unknown URL serves the branded 404 page with a 404 status', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist.html');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/Page not found/);
  await expect(page.locator('h1')).toHaveText(/shelf's empty/i);

  // The 404 page intentionally has no main nav — it isn't a nav destination.
  await expect(page.locator('header.site')).toHaveCount(0);
});

test("the 404 page's recovery links lead back into the real site", async ({ page }) => {
  await page.goto('/this-page-does-not-exist.html');

  await page.getByRole('link', { name: 'Back to the home page' }).click();
  await expect(page).toHaveURL(/\/index\.html$/);
  await expect(page).toHaveTitle('Kington Foodbank');
});

test('the 404 page is not indexed by search engines', async ({ page }) => {
  await page.goto('/this-page-does-not-exist.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('the 404 page still shows correct, parameterized contact details', async ({ page }) => {
  await page.goto('/this-page-does-not-exist.html');

  await expect(page.locator('footer.site a[href="mailto:info@kingtonfoodbank.org.uk"]')).toBeVisible();
  await expect(page.locator('footer.site a[href="tel:+447794439644"]')).toBeVisible();
});
