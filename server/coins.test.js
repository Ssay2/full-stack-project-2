const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowed } = require('./coins');

test('isAllowed returns true for a known coin id', () => {
  assert.equal(isAllowed('bitcoin'), true);
});

test('isAllowed returns false for an unknown coin id', () => {
  assert.equal(isAllowed('nonsense'), false);
});
