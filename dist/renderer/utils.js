const path = require('path');

function getAssetPath(relativePath) {
    let fullPath;
    if (process.env.NODE_ENV === 'development') {
        // In development, the assets are in the root of the project
        fullPath = path.join(process.cwd(), 'assets', relativePath);
    } else {
        fullPath = path.join(process.resourcesPath, 'assets', relativePath);
    }
    console.log(`Asset path for ${relativePath}:`, fullPath);
    console.log('Current working directory:', process.cwd());
    console.log('Environment:', process.env.NODE_ENV);
    return fullPath;
}

module.exports = {
    getAssetPath
}; 