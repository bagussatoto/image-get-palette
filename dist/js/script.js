const colorThief = new ColorThief();
const imagePreview = document.querySelector('#image-preview');
const imageUpload = document.querySelector('#image-upload');
const dominantColorEl = document.querySelector('#dominant-color');
const paletteEl = document.querySelector('#palette');
const DEFAULT_SRC = './assets/img/owner.jpg';

function RGBToHex(r, g, b) {
    return (
        '#' +
        [r, g, b]
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('')
    );
}

function renderSwatch(color, withWrapper = false) {
    const hexColor = RGBToHex(color[0], color[1], color[2]);
    const content = `<div class="shadow-xl h-10 w-10 rounded-full" style="background-color: ${hexColor}; --tw-shadow-color: rgb(${color[0]} ${color[1]} ${color[2]} / 0.4); --tw-shadow: var(--tw-shadow-colored);"></div><span class="font-bold uppercase text-gray-800">${hexColor}</span>`;
    return withWrapper ? `<div class="flex gap-1 items-center">${content}</div>` : content;
}

function renderAll() {
    if (!imagePreview.complete || imagePreview.naturalWidth === 0) {
        return;
    }

    try {
        const dominantColor = colorThief.getColor(imagePreview);
        const paletteColors = colorThief.getPalette(imagePreview);

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

let initialSrc = DEFAULT_SRC;
try {
    const storedSrc = localStorage.getItem('src');
    if (storedSrc) {
        initialSrc = storedSrc;
    } else {
        localStorage.setItem('src', DEFAULT_SRC);
    }
} catch (err) {
    console.warn('Unable to access localStorage:', err);
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

        try {
            localStorage.setItem('src', src);
        } catch (err) {
            console.warn('Image is too large to persist in localStorage:', err);
        }
    };
    reader.readAsDataURL(file);
});
