"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAutoStart = setupAutoStart;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function setupAutoStart(enable) {
    const appPath = electron_1.app.getPath('exe');
    const appName = electron_1.app.getName();
    switch (process.platform) {
        case 'win32':
            setupWindowsAutoStart(enable, appPath, appName);
            break;
        case 'linux':
            setupLinuxAutoStart(enable, appPath, appName);
            break;
        case 'darwin':
            setupMacAutoStart(enable);
            break;
    }
}
function setupWindowsAutoStart(enable, appPath, appName) {
    const squirrelStartup = require('electron-squirrel-startup');
    if (squirrelStartup)
        return;
    // Get startup path
    const startupFolder = path_1.default.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const shortcutPath = path_1.default.join(startupFolder, `${appName}.lnk`);
    if (enable) {
        const { execSync } = require('child_process');
        const shortcutCommand = `powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${shortcutPath}'); $Shortcut.TargetPath = '${appPath}'; $Shortcut.Arguments = '--hidden'; $Shortcut.Save()"`;
        execSync(shortcutCommand);
    }
    else {
        if (fs_1.default.existsSync(shortcutPath)) {
            fs_1.default.unlinkSync(shortcutPath);
        }
    }
}
function setupLinuxAutoStart(enable, appPath, appName) {
    const autostartDir = path_1.default.join(process.env.HOME || '', '.config', 'autostart');
    const desktopFile = path_1.default.join(autostartDir, `${appName}.desktop`);
    if (enable) {
        if (!fs_1.default.existsSync(autostartDir)) {
            fs_1.default.mkdirSync(autostartDir, { recursive: true });
        }
        const desktopEntry = `[Desktop Entry]
                                Type=Application
                                Name=${appName}
                                Exec="${appPath}" --hidden
                                Terminal=false
                                Hidden=false`;
        fs_1.default.writeFileSync(desktopFile, desktopEntry);
    }
    else {
        if (fs_1.default.existsSync(desktopFile)) {
            fs_1.default.unlinkSync(desktopFile);
        }
    }
}
function setupMacAutoStart(enable) {
    electron_1.app.setLoginItemSettings({
        openAtLogin: enable,
        path: electron_1.app.getPath('exe'),
        args: ['--hidden']
    });
}
