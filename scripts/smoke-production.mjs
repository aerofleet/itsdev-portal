import fs from 'node:fs/promises';
import path from 'node:path';
import { verifyRoute } from './smoke-route.mjs';

const articlesPath = path.resolve('.codex/directus-content/articles');
const files = (await fs.readdir(articlesPath)).filter((file) => file.endsWith('.md'));
if (files.length === 0) throw new Error('No synchronized Directus articles are available for the production smoke test.');

// The first listing page contains only the newest page of articles.
await verifyRoute('https://itsdev.kr/articles/', (html) => files.some((file) => html.includes(`/articles/${path.basename(file, '.md')}/`)));

for (const file of files) {
  const slug = path.basename(file, '.md');
  const url = `https://itsdev.kr/articles/${slug}/`;
  await verifyRoute(url, (html) => html.includes('<article class="fieldnote"'));
}

console.log(`Production smoke test passed: ${files.length} published article route(s) returned rendered article pages.`);
