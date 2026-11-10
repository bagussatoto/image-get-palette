const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'js');
const outDir = path.join(__dirname, '..', 'dist', 'js');

fs.mkdirSync(outDir, { recursive: true });

for (const file of fs.readdirSync(srcDir).filter((name) => name.endsWith('.js'))) {
    fs.copyFileSync(path.join(srcDir, file), path.join(outDir, file));
    console.log(`Copied src/js/${file} -> dist/js/${file}`);
}
