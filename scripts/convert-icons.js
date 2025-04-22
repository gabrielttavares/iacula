const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../build/icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Convert PNG to ICO for Windows
try {
    execSync(`convert assets/images/icon.png -define icon:auto-resize=16,32,48,64,128,256 build/icons/icon.ico`);
    console.log('Windows icon created successfully');
} catch (error) {
    console.error('Error creating Windows icon:', error);
}

// Convert PNG to ICNS for macOS
try {
    // Create temporary directory for icon set
    const iconSetDir = path.join(iconsDir, 'icon.iconset');
    if (!fs.existsSync(iconSetDir)) {
        fs.mkdirSync(iconSetDir);
    }

    // Generate different sizes
    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    sizes.forEach(size => {
        execSync(`convert assets/images/icon.png -resize ${size}x${size} ${iconSetDir}/icon_${size}x${size}.png`);
        if (size <= 256) {
            execSync(`convert assets/images/icon.png -resize ${size * 2}x${size * 2} ${iconSetDir}/icon_${size}x${size}@2x.png`);
        }
    });

    // Convert to ICNS
    execSync(`iconutil -c icns ${iconSetDir} -o build/icons/icon.icns`);
    console.log('macOS icon created successfully');
} catch (error) {
    console.error('Error creating macOS icon:', error);
} 