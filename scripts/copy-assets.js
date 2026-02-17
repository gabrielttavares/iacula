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
ensureDirExists('dist/presentation/popup');
ensureDirExists('dist/presentation/angelus');
ensureDirExists('dist/presentation/regina-caeli');
ensureDirExists('dist/presentation/settings');
ensureDirExists('dist/presentation/liturgy-reminder');
ensureDirExists('dist/assets');

// Copy presentation layer HTML files
const presentationDirs = [
    { src: 'src/presentation/popup', dest: 'dist/presentation/popup' },
    { src: 'src/presentation/angelus', dest: 'dist/presentation/angelus' },
    { src: 'src/presentation/regina-caeli', dest: 'dist/presentation/regina-caeli' },
    { src: 'src/presentation/settings', dest: 'dist/presentation/settings' },
    { src: 'src/presentation/liturgy-reminder', dest: 'dist/presentation/liturgy-reminder' },
];

presentationDirs.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
        fs.readdirSync(src).forEach(file => {
            if (file.endsWith('.html')) {
                copyFiles(
                    path.join(src, file),
                    path.join(dest, file)
                );
            }
        });
    }
});

// Copy assets
copyFiles('assets/prayers', 'dist/assets/prayers');
copyFiles('assets/images', 'dist/assets/images');
copyFiles('assets/quotes', 'dist/assets/quotes');

console.log('Assets copied successfully!');
