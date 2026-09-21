const test = require('node:test');
const assert = require('node:assert/strict');
const { addPoint, getHistory, MAX_POINTS } = require('./priceStore');

test('caps history at 50 points, dropping the oldest', () => {
  const coin = `test-cap-${Date.now()}`;

  for (let i = 0; i < 60; i++) {
    addPoint(coin, { price: i, change24h: 0, timestamp: String(i) });
  }

  const history = getHistory(coin);
  assert.equal(history.length, MAX_POINTS);
  assert.equal(history[0].price, 10);
  assert.equal(history[history.length - 1].price, 59);
});

test('getHistory returns a copy, not a live reference', () => {
  const coin = `test-copy-${Date.now()}`;
  addPoint(coin, { price: 1, change24h: 0, timestamp: '1' });

  const history = getHistory(coin);
  history.push({ price: 999, change24h: 0, timestamp: '999' });

  assert.equal(getHistory(coin).length, 1);
});

test('unknown coin returns an empty array', () => {
  assert.deepEqual(getHistory('never-added'), []);
});
