(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PaletteUtils = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const VALID_FORMATS = ['hex', 'rgb', 'hsl'];

    function clampChannel(value) {
        return Math.min(255, Math.max(0, Math.round(Number(value) || 0)));
    }

    function RGBToHex(r, g, b) {
        return (
            '#' +
            [r, g, b]
                .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
                .join('')
        );
    }

    function RGBToString(r, g, b) {
        return `rgb(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)})`;
    }

    function RGBToHSL(r, g, b) {
        const rn = clampChannel(r) / 255;
        const gn = clampChannel(g) / 255;
        const bn = clampChannel(b) / 255;

        const max = Math.max(rn, gn, bn);
        const min = Math.min(rn, gn, bn);
        const delta = max - min;
        const l = (max + min) / 2;

        let h = 0;
        let s = 0;

        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            if (max === rn) {
                h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
            } else if (max === gn) {
                h = ((bn - rn) / delta + 2) * 60;
            } else {
                h = ((rn - gn) / delta + 4) * 60;
            }
        }

        return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    function normalizeFormat(format) {
        const normalized = typeof format === 'string' ? format.toLowerCase() : '';
        return VALID_FORMATS.includes(normalized) ? normalized : 'hex';
    }

    function formatColor(color, format = 'hex') {
        const [r, g, b] = color;
        const formatters = {
            hex: () => RGBToHex(r, g, b),
            rgb: () => RGBToString(r, g, b),
            hsl: () => RGBToHSL(r, g, b),
        };
        return formatters[normalizeFormat(format)]();
    }

    function clampCount(value, min, max, fallback) {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed)) {
            return fallback;
        }
        return Math.min(max, Math.max(min, parsed));
    }

    function exportPaletteAsCSS(dominantColor, paletteColors, format = 'hex') {
        const activeFormat = normalizeFormat(format);
        const lines = [];

        if (Array.isArray(dominantColor)) {
            lines.push(`  --color-dominant: ${formatColor(dominantColor, activeFormat)};`);
        }

        if (Array.isArray(paletteColors)) {
            paletteColors.forEach((color, index) => {
                lines.push(`  --color-palette-${index + 1}: ${formatColor(color, activeFormat)};`);
            });
        }

        return `:root {\n${lines.join('\n')}\n}\n`;
    }

    function exportPaletteAsJSON(dominantColor, paletteColors, format = 'hex') {
        const activeFormat = normalizeFormat(format);
        const payload = {
            format: activeFormat,
            dominant: Array.isArray(dominantColor) ? formatColor(dominantColor, activeFormat) : null,
            palette: Array.isArray(paletteColors)
                ? paletteColors.map((color) => formatColor(color, activeFormat))
                : [],
        };
        return JSON.stringify(payload, null, 2) + '\n';
    }

    return {
        RGBToHex,
        RGBToString,
        RGBToHSL,
        normalizeFormat,
        formatColor,
        clampCount,
        exportPaletteAsCSS,
        exportPaletteAsJSON,
    };
});
