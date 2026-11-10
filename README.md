<div align="center">

# Image to Palette

**Extract dominant colors and customizable palettes from any image — 100% client-side in your browser.**

[![Build CSS CI](https://github.com/bagussatoto/image-get-palette/actions/workflows/jekyll.yml/badge.svg)](https://github.com/bagussatoto/image-get-palette/actions/workflows/jekyll.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/Demo-Netlify-00C7B7?logo=netlify&logoColor=white)](https://imagetopalette.netlify.app/)

[Live Demo](https://imagetopalette.netlify.app/) · [Features](#features) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Contributing](#contributing)

![Image to Palette Preview](./assets/ss/hasil.png)

</div>

---

## Overview

**Image to Palette** is a lightweight, zero-backend web application built with Vanilla JavaScript, Tailwind CSS, DaisyUI, and ColorThief. Upload or drop an image to instantly inspect its dominant color and extract a clean palette, switch between **HEX**, **RGB**, and **HSL** formats, copy individual swatches, or export the entire palette to **CSS** or **JSON**.

All image processing runs locally inside your browser — no images are ever uploaded to a server.

---

## Features

| Feature | Description |
| --- | --- |
| **Dominant Color & Palette** | Extracts the primary dominant color and a palette of **2 to 10** colors via ColorThief. |
| **HEX / RGB / HSL Switcher** | Toggle output formats on the fly; both preview labels and copied values update immediately. |
| **One-Click Copy** | Click any swatch value to copy it to your clipboard (with `execCommand` fallback for older contexts). |
| **Drag & Drop Upload** | Drag and drop images directly onto the preview area, or click to select a file with `image/*` validation. |
| **CSS & JSON Export** | Copy `:root` CSS custom properties or structured JSON, or download `palette.css` / `palette.json`. |
| **Light & Dark Mode** | Syncs with OS `prefers-color-scheme` on first visit and persists manual theme selection. |
| **Local Persistence** | Remembers your last image, color format, palette size, and theme safely in `localStorage`. |

---

## Tech Stack

- **Frontend:** HTML5, [Tailwind CSS v3](https://tailwindcss.com/), [DaisyUI v4](https://daisyui.com/), [Boxicons](https://boxicons.com/)
- **Color Extraction:** [ColorThief](https://lokeshdhakar.com/projects/color-thief/) (loaded via CDN)
- **Tooling & Testing:** [Node.js](https://nodejs.org/) (`node --test`), [GitHub Actions](.github/workflows/jekyll.yml)

---

## Project Structure

```text
image-get-palette/
├── .github/workflows/   # GitHub Actions CI (runs unit tests and production build)
├── assets/
│   ├── ico/             # Favicons and touch/tile icons
│   ├── img/             # Default sample photo
│   └── ss/              # Application screenshot
├── dist/
│   ├── css/             # Compiled & minified Tailwind CSS bundle
│   └── js/              # Built JavaScript files referenced by index.html
├── scripts/
│   └── build-js.js      # Copies source JS files from src/js/ to dist/js/
├── src/
│   ├── css/             # Tailwind CSS entrypoint (style.css)
│   └── js/              # Application source code (script.js, utils.js)
├── tests/
│   └── utils.test.js    # Unit tests for color conversion, clamping, and exporters
├── index.html           # Main HTML entry page
├── package.json         # npm scripts and devDependencies
└── tailwind.config.js   # Tailwind CSS & DaisyUI configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 18` (required for the built-in `node --test` runner)
- **npm**

### Installation

```bash
git clone https://github.com/bagussatoto/image-get-palette.git
cd image-get-palette
npm install
```

### Running Locally

Serve the repository over a local HTTP server:

```bash
npx serve .
```

Then open the local URL printed in your terminal.

> [!IMPORTANT]
> Do not open `index.html` directly with the `file://` protocol. Browsers enforce Canvas CORS restrictions on `file://` origins, which prevents ColorThief from reading image pixels.

---

## Development & Testing

| Script | Purpose |
| --- | --- |
| `npm run dev` | Copies `src/js/` to `dist/js/` and watches `src/css/style.css` for changes |
| `npm run minify` | Runs `build:js` and compiles minified CSS to `dist/css/style.css` (used by CI) |
| `npm run build:js` | Copies JavaScript files from `src/js/` to `dist/js/` |
| `npm run build:css` | Compiles and minifies Tailwind CSS output |
| `npm test` | Runs the unit test suite in `tests/utils.test.js` |

**Workflow tip:** Always edit JavaScript inside `src/js/` (not `dist/js/`), then run `npm test` and `npm run minify` before committing.

---

## Contributing

Contributions, bug reports, and feature requests are welcome:

1. Check existing issues or open a new one at [GitHub Issues](https://github.com/bagussatoto/image-get-palette/issues).
2. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a Pull Request.
3. Ensure `npm test` and `npm run minify` pass cleanly.

---

## Author

**Bagus Budi Satoto** — Bachelor of Informatics, University Amikom Yogyakarta  
GitHub: [@bagussatoto](https://github.com/bagussatoto)

---

## License

This project is open source and available under the [MIT License](./LICENSE).
