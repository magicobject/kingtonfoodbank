import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { PAGES } from './support/pages';

function formatViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']): string {
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `    - ${n.target.join(' ')}\n      ${n.failureSummary?.replace(/\n/g, ' ')}`).join('\n');
      return `[${v.impact}] ${v.id}: ${v.description}\n${nodes}`;
    })
    .join('\n\n');
}

for (const page_ of PAGES) {
  test(`axe: ${page_.path} has no accessibility violations`, async ({ page }) => {
    await page.goto(page_.path);
    // Force-settle the reveal-on-scroll animation so this tests the real
    // final state, not a mid-transition frame — an element still fading in
    // from opacity:0 reads as low-contrast to axe, which isn't a real bug.
    // Adding the .in class alone isn't enough (it starts a fresh transition
    // rather than jumping to the end state), so the transition itself is
    // killed too.
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('in');
        (el as HTMLElement).style.transition = 'none';
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
    });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
}
