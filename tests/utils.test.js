const test = require('node:test');
const assert = require('node:assert/strict');
const {
    RGBToHex,
    RGBToString,
    RGBToHSL,
    normalizeFormat,
    formatColor,
    clampCount,
} = require('../src/js/utils.js');

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

test('RGBToString formats rgb() string and clamps values', () => {
    assert.equal(RGBToString(255, 128, 0), 'rgb(255, 128, 0)');
    assert.equal(RGBToString(-5, 300, 12.4), 'rgb(0, 255, 12)');
});

test('RGBToHSL converts primary, grayscale, and mid-tone colors', () => {
    assert.equal(RGBToHSL(255, 0, 0), 'hsl(0, 100%, 50%)');
    assert.equal(RGBToHSL(0, 255, 0), 'hsl(120, 100%, 50%)');
    assert.equal(RGBToHSL(0, 0, 255), 'hsl(240, 100%, 50%)');
    assert.equal(RGBToHSL(128, 128, 128), 'hsl(0, 0%, 50%)');
    assert.equal(RGBToHSL(255, 128, 0), 'hsl(30, 100%, 50%)');
});

test('normalizeFormat and formatColor support hex, rgb, and hsl with fallback', () => {
    assert.equal(normalizeFormat('RGB'), 'rgb');
    assert.equal(normalizeFormat('unknown'), 'hex');
    assert.equal(formatColor([255, 128, 0], 'hex'), '#ff8000');
    assert.equal(formatColor([255, 128, 0], 'rgb'), 'rgb(255, 128, 0)');
    assert.equal(formatColor([255, 128, 0], 'hsl'), 'hsl(30, 100%, 50%)');
    assert.equal(formatColor([255, 128, 0], 'invalid'), '#ff8000');
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
