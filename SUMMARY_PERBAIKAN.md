# Ringkasan Perbaikan & Pengembangan — Image to Palette

Dokumen ini merangkum seluruh temuan evaluasi, perbaikan error, pembersihan konfigurasi/dependensi, serta fitur baru yang telah diterapkan pada proyek **Image to Palette**.

---

## 1. Masalah Awal yang Ditemukan & Perbaikannya

### A. JavaScript (`src/js/script.js` / `dist/js/script.js`)
- **Crash saat batal memilih file (`TypeError`)**: Mengakses `e.target.files[0]['type']` tanpa pengecekan menyebabkan error jika user menekan **Cancel** pada dialog pilih file.
  - **Perbaikan**: Menambahkan pengecekan `const file = e.target.files?.[0]; if (!file) return;` serta validasi `file.type.startsWith('image/')`.
- **Event listener `load` menumpuk & tidak ada `try...catch`**: `getAll()` sebelumnya tidak menerima parameter namun dipanggil dengan `getAll(imagePreview)` dan memasang listener `load` berulang kali. Selain itu, akses piksel `ColorThief` saat gambar belum siap atau dibuka via `file://` (CORS) melempar error tanpa penanganan.
  - **Perbaikan**: Menggunakan satu listener `load` dan `error` pada `imagePreview`, pengecekan `imagePreview.complete && imagePreview.naturalWidth === 0`, serta `try...catch` di `renderAll()`.
- **Potensi `QuotaExceededError` di `localStorage`**: Gambar ukuran besar yang disimpan sebagai DataURL bisa melebihi kuota `localStorage`.
  - **Perbaikan**: Membungkus `localStorage.getItem`, `localStorage.setItem`, dan `localStorage.removeItem` dalam helper aman (`storageGet`, `storageSet`, dan `try...catch`).
- **Update DOM di dalam loop & class Tailwind dinamis**: `document.querySelector('#palette')` dan `palette.innerHTML` sebelumnya dipanggil di tiap iterasi `forEach`, dan `shadow-[${hexColor}]/40` tidak dapat di-generate Tailwind JIT.
  - **Perbaikan**: Merender semua swatch sekaligus dengan `.map(...).join('')` dan menghapus class dinamis `shadow-[...]`.

### B. HTML & Aksesibilitas (`index.html`)
- **Favicon 404**: `<link rel="apple-touch-icon-precomposed" sizes="57x57" href="apple-touch-icon-57x57.png">` tidak mengarah ke folder `assets/ico/`.
  - **Perbaikan**: Diperbaiki ke `assets/ico/apple-touch-icon-57x57.png`.
- **Tombol GitHub tidak berfungsi**: Tag `<i>` diberi atribut `href` di dalam `<button>` sehingga tidak bisa diklik untuk navigasi, dan teks `bagussatoto` bertumpuk di dalam ikon.
  - **Perbaikan**: Mengubahnya menjadi `<a href="https://github.com/bagussatoto/" target="_blank" rel="noopener noreferrer" aria-label="GitHub bagussatoto">`.
- **Typo class Tailwind `ld:order-1`**: Membuat urutan layout hero di breakpoint `lg` tidak berlaku.
  - **Perbaikan**: Diperbaiki menjadi `lg:order-1`.
- **Markup komentar rusak & Alpine.js tidak terpakai**: Sisa komentar dropdown dan tag `<template x-if="true">` serta script CDN Alpine.js dihapus.
- **Filter input file, ejaan, `alt`, dan SEO**: Menambahkan `accept="image/*"` pada `#image-upload`, memperbaiki ejaan `"Pallete"` → `"Palette"`, menambahkan `alt` deskriptif pada kedua `<img>`, serta menambahkan `<meta name="description">`.

### C. Build CSS, Konfigurasi, Dependensi & CI
- **Tailwind CSS & DaisyUI (`tailwind.config.js`, `dist/css/style.css`)**:
  - Menambahkan `./src/js/*.js` ke `content` agar class yang dirender oleh JS ikut ter-compile.
  - Mengaktifkan tema `'light'` dan `'dark'` pada konfigurasi DaisyUI (`darkTheme: 'light'`) serta mengganti class warna statis di `index.html` ke token tema (`bg-base-100`, `text-base-content`, `border-base-200`, `hover:bg-base-200`).
  - Memperbarui build CSS ter-minify di `dist/css/style.css`.
- **Dependensi (`package.json`, `package-lock.json`)**:
  - Memindahkan paket build yang sebenarnya (`autoprefixer`, `daisyui`, `postcss`, `tailwindcss`) ke `devDependencies` dan membersihkan ~80 sub-dependensi internal dari `dependencies`.
  - Menjalankan `npm install` dan `npm audit fix` hingga **0 vulnerabilities**.
  - Menambahkan script `"dev"`, `"build:js"`, `"build:css"`, `"test"`, dan menyelaraskan `"minify"` (`npm run build:js && npm run build:css`).
- **CI Workflow (`.github/workflows/jekyll.yml`)**:
  - Mengganti build `jekyll build` yang tidak relevan dengan `npm ci`, `npm test`, dan `npm run minify`.
- **Dokumentasi (`README.md`)**:
  - Memperbaiki perintah `cd image-get-palette`, menjelaskan `npm run dev`, `npm run minify`, `npm test`, struktur `src/js/` → `dist/js/`, serta catatan agar dijalankan via web server lokal (`npx serve .`), bukan `file://`.

---

## 2. Fitur Baru yang Ditambahkan

1. **Salin Kode Warna (HEX, RGB, HSL)**
   - Menambahkan [`RGBToString`](src/js/utils.js), [`RGBToHSL`](src/js/utils.js), [`normalizeFormat`](src/js/utils.js), dan [`formatColor`](src/js/utils.js) di `src/js/utils.js`.
   - Menambahkan pemilih format (`HEX` | `RGB` | `HSL`) di `index.html` (`#color-format`) yang tersimpan ke `localStorage` (`colorFormat`).
   - Klik kode warna pada **Dominant Color** maupun **Palette** akan menyalin nilai sesuai format aktif (menggunakan Clipboard API dengan fallback `document.execCommand('copy')`) dan menampilkan umpan balik `"Copied!"`.
2. **Pengaturan Jumlah Warna Palet**
   - Menambahkan slider `#palette-count` (rentang `2–10`, divalidasi oleh [`clampCount`](src/js/utils.js)) yang langsung merender ulang palet dan menyimpan pilihan ke `localStorage` (`paletteCount`).
3. **Mode Gelap / Terang (Dark Mode)**
   - Menambahkan tombol toggle `#theme-toggle` di navbar, mendeteksi preferensi sistem (`prefers-color-scheme: dark`) secara awal, dan menyimpan pilihan ke `localStorage` (`theme`).
4. **Drag & Drop Gambar**
   - Membungkus `#image-preview` ke dalam `#drop-zone` di `index.html` dengan highlight visual saat file diseret (`border-primary`, `bg-primary/5`) dan dukungan klik langsung untuk membuka dialog pilih file.
   - Menyatukan validasi file antara tombol upload dan drag & drop di `handleImageFile` (`src/js/script.js`).
5. **Ekspor Palet CSS & JSON**
   - Menambahkan [`exportPaletteAsCSS`](src/js/utils.js) (`:root` custom properties) dan [`exportPaletteAsJSON`](src/js/utils.js) mengikuti format aktif (**HEX / RGB / HSL**).
   - Menambahkan tombol **Copy CSS**, **Download .css**, **Copy JSON**, dan **Download .json** di `index.html`.
6. **Struktur `src/js/` & Unit Test**
   - Memisahkan logika utilitas ke `src/js/utils.js` dan logika UI ke `src/js/script.js`, dengan skrip salin `scripts/build-js.js` ke `dist/js/`.
   - Menambahkan unit test di `tests/utils.test.js` untuk `RGBToHex`, `RGBToString`, `RGBToHSL`, `normalizeFormat`, `formatColor`, `clampCount`, `exportPaletteAsCSS`, dan `exportPaletteAsJSON`.

---

## 3. Riwayat Commit

| Commit | Deskripsi | Branch |
|---|---|---|
| `e6bc0b0` | `fix: resolve JS upload/palette errors, HTML bugs, and rebuild Tailwind CSS` | `main` |
| `08b44bb` | `ci: replace Jekyll build with Tailwind CSS build` | `main` |
| `af34bb0` | `chore: remove unused Alpine.js, fix typo, add alt text and meta description` | `main` |
| `fe13b3b` | `chore: clean dependencies to devDependencies and fix npm audit vulnerabilities` | `chore/clean-dependencies` |
| `86cf5a6` | `docs: update install and run instructions in README` | `chore/readme-browserslist` |
| `a0b6006` | `feat: add copy hex, palette size slider, dark mode, unit tests and src/js build` | `feat/palette-features` |
| `65fc740` | `feat: add RGB and HSL color format selector and copy support` | `feat/palette-features` |
| `9c447a2` | `docs: add summary of fixes and new features` | `feat/palette-features` |
| `53d330b` | `docs: rewrite README with professional project documentation` | `feat/palette-features` |
| `c6a78c8` | `feat: add drag-and-drop upload and CSS/JSON palette export` | `feat/palette-features` |

---

## 4. Hasil Verifikasi

- `npm test`: **9/9 unit test lulus** (0 gagal).
- `node --check src/js/utils.js` & `node --check src/js/script.js`: lulus tanpa error sintaks.
- `npm run minify`: build `dist/js/` dan `dist/css/style.css` berhasil (exit code 0); seluruh utility class baru terverifikasi hadir di CSS.
- `npm audit`: **0 vulnerabilities**.
- Verifikasi aset lokal di `index.html`: **21/21 file ditemukan** (`Missing: []`).
- **Belum diuji otomatis (perlu tes manual di browser)**: Sandbox membatasi koneksi loopback `127.0.0.1`, sehingga uji interaksi browser penuh perlu dijalankan lokal melalui `npx serve .`.

---

## 5. Langkah Lanjutan untuk Rilis

1. Jalankan `npx serve .` secara lokal dan uji:
   - Toggle dark/light mode, slider jumlah warna (2–10), switch format `HEX` / `RGB` / `HSL`, dan klik salin warna.
   - Upload gambar, batal pilih file (Cancel), dan upload file non-gambar.
2. Buat dan gabungkan Pull Request dari `feat/palette-features` ke `main`:
   - https://github.com/bagussatoto/image-get-palette/pull/new/feat/palette-features
3. Pastikan CI lolos (`npm test` & `npm run minify`), lalu verifikasi hasil deploy di Netlify.

