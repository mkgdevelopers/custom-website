const test = require('node:test');
const assert = require('node:assert/strict');
const { validateLayout } = require('../server');

test('validateLayout accepts well-shaped layout', () => {
  const result = validateLayout({ global: {}, elements: [] });
  assert.equal(result, null);
});

test('validateLayout rejects invalid payload', () => {
  const result = validateLayout({ elements: [] });
  assert.match(result, /global/);
});
