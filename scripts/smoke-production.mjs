import fs from 'node:fs/promises';
import path from 'node:path';

const articlesPath = path.resolve('.codex/directus-content/articles');
const files = (await fs.readdir(articlesPath)).filter((file) => file.endsWith('.md'));
if (files.length === 0) throw new Error('No synchronized Directus articles are available for the production smoke test.');

for (const file of files) {
  const slug = path.basename(file, '.md');
  const url = `https://itsdev.kr/articles/${slug}/`;
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Production article route returned HTTP ${response.status}: ${url}`);
  const html = await response.text();
  if (!html.includes('<article class="fieldnote"')) throw new Error(`Production response is not an article page: ${url}`);
}

console.log(`Production smoke test passed: ${files.length} published article route(s) returned rendered article pages.`);
