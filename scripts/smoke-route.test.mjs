import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyRoute } from './smoke-route.mjs';

const article = '<article class="fieldnote">Published</article>';
const validate = (html) => html.includes('<article class="fieldnote"');
function options(sequence) {
  let calls = 0;
  const waits = [];
  return {
    fetchImpl: async () => { const next = sequence[calls++]; if (next instanceof Error) throw next; return next; },
    sleep: async (ms) => { waits.push(ms); }, log: () => {},
    attempts: sequence.length,
    calls: () => calls, waits,
  };
}
test('deployment 404 and stale HTML recover when the article arrives', async () => {
  const opts = options([new Response('Missing', { status: 404 }), new Response('Old page'), new Response(article)]);
  await verifyRoute('https://example.invalid/article/', validate, opts);
  assert.equal(opts.calls(), 3);
  assert.deepEqual(opts.waits, [10_000, 10_000]);
});
test('persistent 404 fails after the retry budget', async () => {
  const opts = options(Array.from({ length: 3 }, () => new Response('Missing', { status: 404 })));
  await assert.rejects(verifyRoute('https://example.invalid/article/', validate, opts), /HTTP 404/);
  assert.equal(opts.calls(), 3);
  assert.equal(opts.waits.length, 2);
});
test('network failures can recover', async () => {
  const opts = options([new TypeError('fetch failed'), new Response(article)]);
  await verifyRoute('https://example.invalid/article/', validate, opts);
  assert.equal(opts.calls(), 2);
});
test('authorization errors fail immediately', async () => {
  const opts = options([new Response('Denied', { status: 403 }), new Response(article)]);
  await assert.rejects(verifyRoute('https://example.invalid/article/', validate, opts), /HTTP 403/);
  assert.equal(opts.calls(), 1);
  assert.equal(opts.waits.length, 0);
});
