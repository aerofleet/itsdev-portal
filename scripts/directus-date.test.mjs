import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDirectusDate } from './directus-date.mjs';

test('interprets timezone-less Directus date-times as Korea Standard Time', () => {
  assert.equal(parseDirectusDate('2026-10-09T22:57:17').toISOString(), '2026-10-09T13:57:17.000Z');
});

test('preserves an explicit timezone in the Directus value', () => {
  assert.equal(parseDirectusDate('2026-10-09T22:57:17Z').toISOString(), '2026-10-09T22:57:17.000Z');
  assert.equal(parseDirectusDate('2026-10-09T22:57:17+09:00').toISOString(), '2026-10-09T13:57:17.000Z');
});

test('interprets date-only values as midnight in Korea', () => {
  assert.equal(parseDirectusDate('2026-10-09').toISOString(), '2026-10-08T15:00:00.000Z');
});
