const test = require('node:test');
const assert = require('node:assert/strict');
const { fetchPrices } = require('./coingecko');

function mockResponse({ status, headers = {}, body = {} }) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (name) => headers[name] ?? null },
    json: async () => body
  };
}

test('429 with Retry-After header sets retryAfter from the header', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => mockResponse({ status: 429, headers: { 'Retry-After': '30' } });

  try {
    await assert.rejects(fetchPrices(['bitcoin']), (error) => {
      assert.equal(error.retryAfter, 30);
      return true;
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test('429 without Retry-After header defaults retryAfter to 60', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => mockResponse({ status: 429 });

  try {
    await assert.rejects(fetchPrices(['bitcoin']), (error) => {
      assert.equal(error.retryAfter, 60);
      return true;
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test('200 response returns the parsed JSON body', async () => {
  const originalFetch = global.fetch;
  const body = { bitcoin: { usd: 100, usd_24h_change: 1.5 } };
  global.fetch = async () => mockResponse({ status: 200, body });

  try {
    const result = await fetchPrices(['bitcoin']);
    assert.deepEqual(result, body);
  } finally {
    global.fetch = originalFetch;
  }
});
