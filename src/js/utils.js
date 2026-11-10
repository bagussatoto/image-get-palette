(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PaletteUtils = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    function toHexChannel(value) {
        const clamped = Math.min(255, Math.max(0, Math.round(Number(value) || 0)));
        return clamped.toString(16).padStart(2, '0');
    }

    function RGBToHex(r, g, b) {
        return '#' + toHexChannel(r) + toHexChannel(g) + toHexChannel(b);
    }

    function clampCount(value, min, max, fallback) {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed)) {
            return fallback;
        }
        return Math.min(max, Math.max(min, parsed));
    }

    return { RGBToHex, clampCount };
});
