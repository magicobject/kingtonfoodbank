import { test, expect } from './support/fixtures';

test('the homepage loads with its main nav and every section in place', async ({ page }) => {
  await page.goto('/index.html');

  await expect(page).toHaveTitle('Kington Foodbank');
  await expect(page.locator('h1')).toHaveText(/no one in kington should go without food/i);
  await expect(page.locator('header.site nav.links')).toBeVisible();

  for (const [href, id] of [
    ['#help', 'help'],
    ['#donate', 'donate'],
    ['#volunteer', 'volunteer'],
    ['#contact', 'contact'],
  ]) {
    await expect(page.locator(`header.site nav.links a[href="${href}"]`)).toBeVisible();
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test('the brand logo in the header links back to the top of the page', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('a.brand')).toHaveAttribute('href', '#top');
});

test('the Documents page is in the main nav and links to all six PDFs', async ({ page, request }) => {
  await page.goto('/index.html');
  await page.locator('header.site nav.links a[href="/documents.html"]').click();
  await expect(page.locator('h1')).toHaveText(/policies and procedures/i);

  const links = page.locator('ul.doc-list a');
  await expect(links).toHaveCount(6);
  for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')!))) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
  await expect(page.locator('header.site nav.links a[href="/#help"]')).toBeVisible();
});
