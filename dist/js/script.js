const { RGBToHex, clampCount } = PaletteUtils;

const colorThief = new ColorThief();
const imagePreview = document.querySelector('#image-preview');
const imageUpload = document.querySelector('#image-upload');
const dominantColorEl = document.querySelector('#dominant-color');
const paletteEl = document.querySelector('#palette');
const paletteCountEl = document.querySelector('#palette-count');
const paletteCountLabel = document.querySelector('#palette-count-label');
const themeToggle = document.querySelector('#theme-toggle');
const DEFAULT_SRC = './assets/img/owner.jpg';
const MIN_COLORS = 2;
const MAX_COLORS = 10;

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
    const content = `<div class="shadow-xl h-10 w-10 rounded-full" style="background-color: ${hexColor}; --tw-shadow-color: rgb(${color[0]} ${color[1]} ${color[2]} / 0.4); --tw-shadow: var(--tw-shadow-colored);"></div><button type="button" class="copy-hex font-bold uppercase text-base-content hover:underline" data-hex="${hexColor}" title="Click to copy" aria-label="Copy ${hexColor}">${hexColor}</button>`;
    return withWrapper ? `<div class="flex gap-1 items-center">${content}</div>` : content;
}

function renderAll() {
    if (!imagePreview.complete || imagePreview.naturalWidth === 0) {
        return;
    }

    try {
        const dominantColor = colorThief.getColor(imagePreview);
        const paletteColors = colorThief.getPalette(imagePreview, paletteCount);

        if (dominantColor) {
            dominantColorEl.innerHTML = renderSwatch(dominantColor, false);
        }

        if (Array.isArray(paletteColors) && paletteColors.length > 0) {
            paletteEl.innerHTML = paletteColors
                .map((color) => renderSwatch(color, true))
                .join('');
        }
    } catch (err) {
        console.error('Failed to extract palette:', err);
        dominantColorEl.textContent = 'Unable to extract color (open via HTTP/HTTPS server).';
        paletteEl.textContent = '-';
    }
}

/* ---------- Copy hex ---------- */
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

document.addEventListener('click', (e) => {
    const button = e.target.closest('.copy-hex');
    if (!button) {
        return;
    }

    const hex = button.dataset.hex;
    copyText(hex)
        .then(() => {
            button.textContent = 'Copied!';
        })
        .catch((err) => {
            console.warn('Unable to copy:', err);
            button.textContent = 'Copy failed';
        })
        .finally(() => {
            setTimeout(() => {
                button.textContent = hex;
            }, 1200);
        });
});

/* ---------- Image loading ---------- */
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
    const file = e.target.files?.[0];
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
});
