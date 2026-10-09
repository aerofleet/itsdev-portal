import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const api = process.env.DIRECTUS_API_URL;
const token = process.env.DIRECTUS_READ_TOKEN;
const publicRead = process.env.DIRECTUS_PUBLIC_READ === 'true';
const accessId = process.env.CF_ACCESS_CLIENT_ID;
const accessSecret = process.env.CF_ACCESS_CLIENT_SECRET;
const collection = process.env.DIRECTUS_ARTICLES_COLLECTION || 'fieldnotes';
const output = path.resolve('.codex/directus-content/articles');

if (!api || (!token && !publicRead)) {
  console.error('CMS sync requires DIRECTUS_API_URL and either DIRECTUS_READ_TOKEN or DIRECTUS_PUBLIC_READ=true.');
  process.exit(1);
}
let apiOrigin;
try {
  const parsedApi = new URL(api);
  if (parsedApi.protocol !== 'https:') throw new Error('HTTPS is required.');
  apiOrigin = parsedApi.origin;
} catch {
  console.error('DIRECTUS_API_URL must be a valid HTTPS origin.');
  process.exit(1);
}
if ((accessId && !accessSecret) || (!accessId && accessSecret)) {
  console.error('Both Cloudflare Access service-token values must be configured together.');
  process.exit(1);
}
if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(collection)) {
  console.error('DIRECTUS_ARTICLES_COLLECTION must be a collection identifier.');
  process.exit(1);
}

const endpoint = new URL(`/items/${collection}`, apiOrigin);
const fields = [
  'id', 'slug', 'title', 'description', 'documentId', 'pubDate', 'updatedDate',
  'category', 'tags', 'articleType', 'service', 'featured', 'canonical',
  'environment', 'evidenceStatus', 'verifiedAt', 'evidence', 'revisions', 'body', 'status',
];
const headers = { Accept: 'application/json' };
if (!publicRead) headers.Authorization = `Bearer ${token}`;
if (accessId) {
  headers['CF-Access-Client-Id'] = accessId;
  headers['CF-Access-Client-Secret'] = accessSecret;
}

function scalar(value) {
  return value == null ? 'null' : JSON.stringify(value);
}

function recordToMarkdown(record) {
  const slug = record.slug;
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || /^\d+$/.test(slug) || slug === 'category') {
    throw new Error(`Invalid article slug in Directus item ${record.id}`);
  }
  for (const field of ['title', 'description', 'documentId', 'pubDate', 'category', 'tags', 'evidenceStatus', 'body']) {
    if (record[field] == null) throw new Error(`Missing ${field} in Directus item ${record.id}`);
  }
  const frontmatter = {
    title: record.title,
    description: record.description,
    documentId: record.documentId,
    pubDate: record.pubDate,
    updatedDate: record.updatedDate,
    category: record.category,
    tags: record.tags,
    draft: false,
    sample: false,
    articleType: record.articleType,
    service: record.service,
    featured: record.featured ?? false,
    canonical: record.canonical,
    environment: record.environment,
    evidenceStatus: record.evidenceStatus,
    verifiedAt: record.verifiedAt,
    evidence: record.evidence ?? [],
    revisions: record.revisions ?? [],
  };
  const lines = Object.entries(frontmatter)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${scalar(value)}`);
  return `---\n${lines.join('\n')}\n---\n\n${record.body}\n`;
}

const now = new Date();
const collected = [];
for (let page = 1; ; page += 1) {
  const url = new URL(endpoint);
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('filter[status][_eq]', 'published');
  url.searchParams.set('filter[pubDate][_lte]', now.toISOString());
  url.searchParams.set('sort', 'slug');
  url.searchParams.set('limit', '100');
  url.searchParams.set('page', String(page));
  const response = await fetch(url, { headers, redirect: 'error', signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    console.error(`Directus returned HTTP ${response.status}; response content omitted.`);
    process.exit(1);
  }
  const payload = await response.json();
  if (!Array.isArray(payload.data)) throw new Error('Directus response is missing the data array.');
  collected.push(...payload.data);
  if (payload.data.length < 100) break;
  if (page >= 100) throw new Error('Directus result exceeds the 10,000 article safety limit.');
}

const slugs = new Set();
const documentIds = new Set();
const rendered = collected.map((record) => {
  if (record.status !== 'published') throw new Error(`Unpublished item returned: ${record.id}`);
  if (slugs.has(record.slug)) throw new Error(`Duplicate Directus article slug: ${record.slug}`);
  if (documentIds.has(record.documentId)) throw new Error(`Duplicate Directus documentId: ${record.documentId}`);
  slugs.add(record.slug);
  documentIds.add(record.documentId);
  const pubDate = new Date(record.pubDate);
  if (!Number.isFinite(pubDate.getTime()) || pubDate > now) throw new Error(`Invalid or future pubDate in Directus item ${record.id}`);
  return [record.slug, recordToMarkdown(record)];
});

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
for (const [slug, markdown] of rendered) await fs.writeFile(path.join(output, `${slug}.md`), markdown, { flag: 'wx' });
console.log(`Directus sync complete: ${rendered.length} published article(s) staged.`);
