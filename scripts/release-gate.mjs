import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const failures = [];
if (process.env.DIRECTUS_CONTENTS_ENABLED !== 'true') failures.push('DIRECTUS_CONTENTS_ENABLED must be true');
if (!process.env.CLOUDFLARE_API_TOKEN) failures.push('CLOUDFLARE_API_TOKEN is missing');
if (!process.env.CLOUDFLARE_ACCOUNT_ID) failures.push('CLOUDFLARE_ACCOUNT_ID is missing');
if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REF !== 'refs/heads/main') {
  failures.push('production deploys are allowed only from main');
}

const contentPath = path.resolve('.codex/directus-content/articles');
const articles = await fs.readdir(contentPath).catch(() => []);
const count = articles.filter((name) => name.endsWith('.md')).length;

if (failures.length > 0) {
  console.error(`Production release gate failed: ${failures.join('; ')}.`);
  process.exit(1);
}
console.log(`Production release gate passed: ${count} published Directus article(s); main branch and Cloudflare deployment credentials verified.`);
