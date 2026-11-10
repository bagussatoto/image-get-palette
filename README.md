# Image to Palette

A lightweight web application that extracts the dominant color and a customizable color palette from any uploaded image directly in the browser.

**Live Demo:** [imagetopalette.netlify.app](https://imagetopalette.netlify.app/)

![Image to Palette Preview](./assets/ss/hasil.png)

---

## Features

- **Dominant Color & Palette Extraction** — Automatically extracts the dominant color and a palette of 2 to 10 colors using ColorThief.
- **Multiple Color Formats (HEX / RGB / HSL)** — Switch output formats on the fly and copy any color value to your clipboard with a single click.
- **Drag & Drop Image Upload** — Drag and drop an image directly onto the preview area or pick a file via the upload button.
- **Export Palette (CSS / JSON)** — Copy CSS custom properties or JSON directly to your clipboard, or download them as `palette.css` / `palette.json`.
- **Light & Dark Mode** — Automatically follows system color-scheme preferences and persists your selected theme in `localStorage`.
- **Client-Side Image Persistence** — Previews uploaded images locally without server uploads and remembers your latest image and preferences.

---

## Tech Stack

- **Markup & Styling:** HTML5, [Tailwind CSS](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/), [Boxicons](https://boxicons.com/)
- **Logic & Color Extraction:** Vanilla JavaScript, [ColorThief](https://lokeshdhakar.com/projects/color-thief/)
- **Tooling & Testing:** Node.js (`node --test`), GitHub Actions CI

---

## Project Structure

```text
image-get-palette/
├── .github/workflows/   # CI workflow (unit tests & CSS/JS build)
├── assets/              # Favicons, sample image, and README screenshot
├── dist/                # Generated CSS & JS bundles loaded by index.html
├── scripts/             # Build helper scripts (build-js.js)
├── src/
│   ├── css/             # Tailwind CSS entrypoint
│   └── js/              # Source JavaScript (script.js, utils.js)
├── tests/               # Unit tests (utils.test.js)
├── index.html           # Application entry page
├── package.json         # Scripts and devDependencies
└── tailwind.config.js   # Tailwind CSS & DaisyUI configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended; `node --test` is used for unit tests)
- npm

### Installation

```bash
git clone https://github.com/bagussatoto/image-get-palette.git
cd image-get-palette
npm install
```

### Running Locally

Serve the project over HTTP using a local static server:

```bash
npx serve .
```

Open the local URL printed in your terminal.

> **Note:** Do not open `index.html` directly via the `file://` protocol. Browsers block reading image pixel data across `file://` origins (CORS), which prevents ColorThief from generating palettes.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Copies `src/js` to `dist/js` and watches `src/css/style.css` for changes |
| `npm run minify` | Builds `src/js` to `dist/js` and generates minified `dist/css/style.css` |
| `npm run build:js` | Copies JavaScript source files from `src/js/` to `dist/js/` |
| `npm run build:css` | Compiles and minifies Tailwind CSS output to `dist/css/style.css` |
| `npm test` | Runs unit tests in `tests/` using Node's built-in test runner |

Edit JavaScript source files in `src/js/` rather than `dist/js/`, and run `npm run minify` and `npm test` before committing.

---

## Contributing & Issue Reporting

Contributions, bug reports, and feature suggestions are welcome:

- Report bugs or request features via [GitHub Issues](https://github.com/bagussatoto/image-get-palette/issues).
- Follow the contribution guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md) when submitting a Pull Request.

---

## Author

**Bagus Budi Satoto** — Bachelor of Informatics, University Amikom Yogyakarta  
GitHub: [@bagussatoto](https://github.com/bagussatoto)

## License

Licensed under the [MIT License](./LICENSE).
