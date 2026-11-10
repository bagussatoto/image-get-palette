const test = require('node:test');
const assert = require('node:assert/strict');
const { RGBToHex, clampCount } = require('../src/js/utils.js');

test('RGBToHex converts channels to a padded hex string', () => {
    assert.equal(RGBToHex(0, 0, 0), '#000000');
    assert.equal(RGBToHex(255, 255, 255), '#ffffff');
    assert.equal(RGBToHex(1, 2, 3), '#010203');
    assert.equal(RGBToHex(255, 128, 0), '#ff8000');
});

test('RGBToHex clamps and rounds out-of-range values', () => {
    assert.equal(RGBToHex(-10, 300, 127.6), '#00ff80');
    assert.equal(RGBToHex(undefined, null, 'x'), '#000000');
});

test('clampCount keeps values within range', () => {
    assert.equal(clampCount('5', 2, 10, 10), 5);
    assert.equal(clampCount(1, 2, 10, 10), 2);
    assert.equal(clampCount(99, 2, 10, 10), 10);
});

test('clampCount falls back for invalid input', () => {
    assert.equal(clampCount(null, 2, 10, 10), 10);
    assert.equal(clampCount('abc', 2, 10, 7), 7);
});
