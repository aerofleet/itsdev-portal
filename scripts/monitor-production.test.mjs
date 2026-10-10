import test from 'node:test';
import assert from 'node:assert/strict';
import { getAlertAction, probeOnce } from './monitor-production.mjs';

test('production probe checks the home, listing, and one published article', async () => {
  const visited = [];
  const fetchImpl = async (url) => {
    visited.push(url);
    const body = url.endsWith('/articles/')
      ? '<a href="/articles/directus-cms-first-post/">A post</a>'
      : url.endsWith('/articles/directus-cms-first-post/')
        ? '<article class="fieldnote">Published</article>'
        : '<main>Home</main>';
    return new Response(body, { status: 200 });
  };

  assert.deepEqual(await probeOnce({ origin: 'https://example.test', fetchImpl }), { ok: true, failures: [] });
  assert.deepEqual(visited, [
    'https://example.test/',
    'https://example.test/articles/',
    'https://example.test/articles/directus-cms-first-post/',
  ]);
});

test('production probe fails when a required route is unavailable', async () => {
  const result = await probeOnce({
    origin: 'https://example.test',
    fetchImpl: async (url) => new Response('not found', { status: url.endsWith('/articles/') ? 503 : 200 }),
  });
  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /HTTP 503/);
});

test('alert creation and recovery require three consecutive matching rounds', () => {
  assert.equal(getAlertAction([{ ok: false }, { ok: false }, { ok: false }]), 'alert');
  assert.equal(getAlertAction([{ ok: true }, { ok: true }, { ok: true }]), 'resolve');
  assert.equal(getAlertAction([{ ok: false }, { ok: true }, { ok: false }]), 'hold');
});
