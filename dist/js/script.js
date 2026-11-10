const {
    RGBToHex,
    normalizeFormat,
    formatColor,
    clampCount,
    exportPaletteAsCSS,
    exportPaletteAsJSON,
} = PaletteUtils;

const colorThief = new ColorThief();
const imagePreview = document.querySelector('#image-preview');
const imageUpload = document.querySelector('#image-upload');
const dropZone = document.querySelector('#drop-zone');
const dominantColorEl = document.querySelector('#dominant-color');
const paletteEl = document.querySelector('#palette');
const paletteCountEl = document.querySelector('#palette-count');
const paletteCountLabel = document.querySelector('#palette-count-label');
const colorFormatEl = document.querySelector('#color-format');
const exportActionsEl = document.querySelector('#export-actions');
const themeToggle = document.querySelector('#theme-toggle');
const DEFAULT_SRC = './assets/img/owner.jpg';
const MIN_COLORS = 2;
const MAX_COLORS = 10;

let latestDominantColor = null;
let latestPaletteColors = [];

function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (err) {
        console.warn('Unable to read localStorage:', err);
        return null;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        console.warn('Unable to write localStorage:', err);
    }
}

/* ---------- Theme ---------- */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
        themeToggle.querySelector('i').className =
            theme === 'dark' ? 'bx bx-sun text-xl' : 'bx bx-moon text-xl';
    }
}

const savedTheme = storageGet('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storageSet('theme', next);
});

/* ---------- Color format ---------- */
let colorFormat = normalizeFormat(storageGet('colorFormat'));

function updateFormatButtons() {
    if (!colorFormatEl) {
        return;
    }
    for (const btn of colorFormatEl.querySelectorAll('[data-format]')) {
        const active = btn.dataset.format === colorFormat;
        btn.classList.toggle('btn-primary', active);
        btn.setAttribute('aria-pressed', String(active));
    }
}

updateFormatButtons();

if (colorFormatEl) {
    colorFormatEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-format]');
        if (!btn) {
            return;
        }
        colorFormat = normalizeFormat(btn.dataset.format);
        storageSet('colorFormat', colorFormat);
        updateFormatButtons();
        renderAll();
    });
}

/* ---------- Palette count ---------- */
let paletteCount = clampCount(storageGet('paletteCount'), MIN_COLORS, MAX_COLORS, MAX_COLORS);
paletteCountEl.min = MIN_COLORS;
paletteCountEl.max = MAX_COLORS;
paletteCountEl.value = paletteCount;
paletteCountLabel.textContent = paletteCount;

paletteCountEl.addEventListener('input', () => {
    paletteCount = clampCount(paletteCountEl.value, MIN_COLORS, MAX_COLORS, MAX_COLORS);
    paletteCountLabel.textContent = paletteCount;
    storageSet('paletteCount', paletteCount);
    renderAll();
});

/* ---------- Rendering ---------- */
function renderSwatch(color, withWrapper = false) {
    const hexColor = RGBToHex(color[0], color[1], color[2]);
    const displayValue = formatColor(color, colorFormat);
    const caseClass = colorFormat === 'hex' ? 'uppercase' : '';
    const content = `<div class="shrink-0 shadow-xl h-10 w-10 rounded-full" style="background-color: ${hexColor}; --tw-shadow-color: rgb(${color[0]} ${color[1]} ${color[2]} / 0.4); --tw-shadow: var(--tw-shadow-colored);"></div><button type="button" class="copy-color font-bold text-sm ${caseClass} text-base-content hover:underline text-left break-all" data-value="${displayValue}" title="Click to copy" aria-label="Copy ${displayValue}">${displayValue}</button>`;
    return withWrapper ? `<div class="flex gap-2 items-center">${content}</div>` : content;
}

function renderAll() {
    if (!imagePreview.complete || imagePreview.naturalWidth === 0) {
        return;
    }

    try {
        const dominantColor = colorThief.getColor(imagePreview);
        const paletteColors = colorThief.getPalette(imagePreview, paletteCount);

        latestDominantColor = dominantColor || null;
        latestPaletteColors = Array.isArray(paletteColors) ? paletteColors : [];

        if (dominantColor) {
            dominantColorEl.innerHTML = renderSwatch(dominantColor, false);
        }

        if (latestPaletteColors.length > 0) {
            paletteEl.innerHTML = latestPaletteColors
                .map((color) => renderSwatch(color, true))
                .join('');
        }
    } catch (err) {
        console.error('Failed to extract palette:', err);
        latestDominantColor = null;
        latestPaletteColors = [];
        dominantColorEl.textContent = 'Unable to extract color (open via HTTP/HTTPS server).';
        paletteEl.textContent = '-';
    }
}

/* ---------- Copy & Export ---------- */
function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy') ? resolve() : reject(new Error('copy command failed'));
        } catch (err) {
            reject(err);
        } finally {
            document.body.removeChild(area);
        }
    });
}

function flashButtonLabel(button, tempLabel, originalLabel) {
    button.textContent = tempLabel;
    setTimeout(() => {
        if (button.isConnected) {
            button.textContent = originalLabel;
        }
    }, 1200);
}

function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

document.addEventListener('click', (e) => {
    const button = e.target.closest('.copy-color');
    if (!button) {
        return;
    }

    const value = button.dataset.value;
    copyText(value)
        .then(() => flashButtonLabel(button, 'Copied!', value))
        .catch((err) => {
            console.warn('Unable to copy:', err);
            flashButtonLabel(button, 'Copy failed', value);
        });
});

if (exportActionsEl) {
    exportActionsEl.addEventListener('click', (e) => {
        const button = e.target.closest('[data-export-type][data-export-mode]');
        if (!button || (!latestDominantColor && latestPaletteColors.length === 0)) {
            return;
        }

        const type = button.dataset.exportType;
        const mode = button.dataset.exportMode;
        const content =
            type === 'css'
                ? exportPaletteAsCSS(latestDominantColor, latestPaletteColors, colorFormat)
                : exportPaletteAsJSON(latestDominantColor, latestPaletteColors, colorFormat);

        if (mode === 'download') {
            const filename = type === 'css' ? 'palette.css' : 'palette.json';
            const mimeType = type === 'css' ? 'text/css' : 'application/json';
            downloadTextFile(filename, content, mimeType);
            return;
        }

        const originalLabel = button.dataset.label || button.textContent;
        button.dataset.label = originalLabel;
        copyText(content)
            .then(() => flashButtonLabel(button, 'Copied!', originalLabel))
            .catch((err) => {
                console.warn('Unable to copy export:', err);
                flashButtonLabel(button, 'Copy failed', originalLabel);
            });
    });
}

/* ---------- Image loading & Drag-and-Drop ---------- */
function handleImageFile(file) {
    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        alert('Looks like what you uploaded is not an image :(');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const src = event.target.result;
        imagePreview.src = src;
        storageSet('src', src);
    };
    reader.readAsDataURL(file);
}

imagePreview.addEventListener('load', renderAll);
imagePreview.addEventListener('error', () => {
    if (imagePreview.getAttribute('src') !== DEFAULT_SRC) {
        try {
            localStorage.removeItem('src');
        } catch (err) {
            console.warn('Unable to clear localStorage:', err);
        }
        imagePreview.src = DEFAULT_SRC;
    } else {
        latestDominantColor = null;
        latestPaletteColors = [];
        dominantColorEl.textContent = 'Failed to load image.';
        paletteEl.textContent = '-';
    }
});

let initialSrc = storageGet('src');
if (!initialSrc) {
    initialSrc = DEFAULT_SRC;
    storageSet('src', DEFAULT_SRC);
}

imagePreview.src = initialSrc;
if (imagePreview.complete && imagePreview.naturalWidth > 0) {
    renderAll();
}

imageUpload.addEventListener('change', (e) => {
    handleImageFile(e.target.files?.[0]);
});

if (dropZone) {
    const setDragState = (active) => {
        dropZone.classList.toggle('border-primary', active);
        dropZone.classList.toggle('bg-primary/5', active);
    };

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragState(true);
        });
    });

    ['dragleave', 'dragend'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!dropZone.contains(e.relatedTarget)) {
                setDragState(false);
            }
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState(false);
        handleImageFile(e.dataTransfer?.files?.[0]);
    });

    dropZone.addEventListener('click', () => {
        imageUpload.click();
    });
}
