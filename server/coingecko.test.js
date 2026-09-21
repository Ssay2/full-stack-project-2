const test = require('node:test');
const assert = require('node:assert/strict');
const { fetchPrices } = require('./coingecko');

function mockFetch(response) {
  global.fetch = async () => response;
}

test('429 with Retry-After header sets retryAfter from the header', async () => {
  mockFetch({
    status: 429,
    ok: false,
    headers: { get: (name) => (name === 'Retry-After' ? '30' : null) }
  });

  await assert.rejects(
    () => fetchPrices(['bitcoin']),
    (error) => error.retryAfter === 30
  );
});

test('429 without Retry-After header defaults retryAfter to 60', async () => {
  mockFetch({
    status: 429,
    ok: false,
    headers: { get: () => null }
  });

  await assert.rejects(
    () => fetchPrices(['bitcoin']),
    (error) => error.retryAfter === 60
  );
});

test('200 returns the parsed JSON object', async () => {
  const payload = { bitcoin: { usd: 100, usd_24h_change: 1.5 } };
  mockFetch({
    status: 200,
    ok: true,
    headers: { get: () => null },
    json: async () => payload
  });

  const result = await fetchPrices(['bitcoin']);
  assert.deepEqual(result, payload);
});
