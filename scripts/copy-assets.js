const fs = require('fs');
const path = require('path');

function ensureDirExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyFiles(source, dest) {
    if (!fs.existsSync(source)) {
        console.log(`Source path does not exist: ${source}`);
        return;
    }

    ensureDirExists(path.dirname(dest));

    if (fs.statSync(source).isDirectory()) {
        ensureDirExists(dest);
        const files = fs.readdirSync(source);
        files.forEach(file => {
            const srcPath = path.join(source, file);
            const destPath = path.join(dest, file);
            copyFiles(srcPath, destPath);
        });
    } else {
        fs.copyFileSync(source, dest);
    }
}

// Ensure dist directories exist
ensureDirExists('dist/renderer');
ensureDirExists('dist/assets');

// Copy renderer files
const rendererDir = 'src/renderer';
fs.readdirSync(rendererDir).forEach(file => {
    if (file.endsWith('.html') || file.endsWith('.js')) {
        copyFiles(
            path.join(rendererDir, file),
            path.join('dist/renderer', file)
        );
    }
});

// Copy assets
copyFiles('assets/prayers', 'dist/assets/prayers');
copyFiles('assets/images', 'dist/assets/images');

console.log('Assets copied successfully!'); 