// Single source of truth for what each generated page should look like.
// Used across specs so a new page only needs an entry added here.
export interface SitePage {
  /** Path served by the static test server, e.g. "/index.html". */
  path: string;
  /** Substring expected in <title>. */
  titleContains: string;
}

export const PAGES: SitePage[] = [
  { path: '/index.html', titleContains: 'Kington Foodbank' },
  { path: '/updates.html', titleContains: 'Site Updates' },
  { path: '/404.html', titleContains: 'Page not found' },
];
