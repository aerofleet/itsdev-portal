import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parseDirectusDate } from './directus-date.mjs';

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
const omittedOptionalMetadata = new Set();
const fields = [
  'id', 'slug', 'title', 'description', 'documentId', 'pubDate', 'updatedDate',
  'category', 'tags', 'articleType', 'service', 'featured', 'canonical',
  'environment', 'evidenceStatus', 'verifiedAt', 'evidence', 'revisions', 'body', 'status',
];
const articleTypes = ['design', 'decision', 'incident', 'implementation'];
const services = ['djc', 'withbuddy', 'myai'];
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
  const articleType = articleTypes.includes(record.articleType) ? record.articleType : undefined;
  const service = services.includes(record.service) ? record.service : undefined;
  const canonical = typeof record.canonical === 'string' && /^https:\/\//i.test(record.canonical) ? record.canonical : undefined;
  const environment = Array.isArray(record.environment) && record.environment.every((value) => typeof value === 'string')
    ? record.environment
    : undefined;
  if (record.articleType != null && articleType === undefined) omittedOptionalMetadata.add('articleType');
  if (record.service != null && service === undefined) omittedOptionalMetadata.add('service');
  if (record.canonical != null && canonical === undefined) omittedOptionalMetadata.add('canonical');
  if (record.environment != null && environment === undefined) omittedOptionalMetadata.add('environment');
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
    articleType,
    service,
    featured: record.featured ?? false,
    canonical,
    environment,
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
let scheduled = 0;
const rendered = collected.flatMap((record) => {
  if (record.status !== 'published') throw new Error(`Unpublished item returned: ${record.id}`);
  const pubDate = parseDirectusDate(record.pubDate);
  if (!Number.isFinite(pubDate.getTime())) throw new Error(`Invalid pubDate in Directus item ${record.id}`);
  if (pubDate > now) {
    scheduled += 1;
    return [];
  }
  if (slugs.has(record.slug)) throw new Error(`Duplicate Directus article slug: ${record.slug}`);
  if (documentIds.has(record.documentId)) throw new Error(`Duplicate Directus documentId: ${record.documentId}`);
  slugs.add(record.slug);
  documentIds.add(record.documentId);
  return [[record.slug, recordToMarkdown({ ...record, pubDate: pubDate.toISOString() })]];
});

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
for (const [slug, markdown] of rendered) await fs.writeFile(path.join(output, `${slug}.md`), markdown, { flag: 'wx' });
if (omittedOptionalMetadata.size > 0) {
  console.warn(`Omitted unsupported optional Directus metadata field(s): ${[...omittedOptionalMetadata].sort().join(', ')}.`);
}
console.log(`Directus sync complete: ${rendered.length} published article(s) staged; ${scheduled} future article(s) withheld.`);
