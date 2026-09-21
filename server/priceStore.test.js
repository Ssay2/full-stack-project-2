const test = require('node:test');
const assert = require('node:assert/strict');
const { addPoint, getHistory } = require('./priceStore');

test('addPoint keeps only the latest 50 points', () => {
  for (let i = 0; i < 60; i++) {
    addPoint('testcoin', { price: i, change24h: 0, timestamp: String(i) });
  }

  const history = getHistory('testcoin');
  assert.equal(history.length, 50);
  assert.equal(history[0].timestamp, '10');
  assert.equal(history[49].timestamp, '59');
});

test('getHistory returns a copy, not a live reference', () => {
  addPoint('anothercoin', { price: 1, change24h: 0, timestamp: '0' });

  const history = getHistory('anothercoin');
  history.push({ price: 999, change24h: 0, timestamp: 'mutated' });

  const historyAgain = getHistory('anothercoin');
  assert.equal(historyAgain.length, 1);
});

test('getHistory returns an empty array for an unknown coin', () => {
  assert.deepEqual(getHistory('nonexistent'), []);
});
