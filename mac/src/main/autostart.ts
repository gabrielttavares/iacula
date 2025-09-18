import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export function setupAutoStart(enable: boolean) {
    const appPath = app.getPath('exe');
    const appName = app.getName();

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

function setupWindowsAutoStart(enable: boolean, appPath: string, appName: string) {
    const squirrelStartup = require('electron-squirrel-startup');
    if (squirrelStartup) return;

    // Get startup path
    const startupFolder = path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const shortcutPath = path.join(startupFolder, `${appName}.lnk`);

    if (enable) {
        const { execSync } = require('child_process');
        const shortcutCommand = `powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${shortcutPath}'); $Shortcut.TargetPath = '${appPath}'; $Shortcut.Arguments = '--hidden'; $Shortcut.Save()"`;
        execSync(shortcutCommand);
    } else {
        if (fs.existsSync(shortcutPath)) {
            fs.unlinkSync(shortcutPath);
        }
    }
}

function setupLinuxAutoStart(enable: boolean, appPath: string, appName: string) {
    const autostartDir = path.join(process.env.HOME || '', '.config', 'autostart');
    const desktopFile = path.join(autostartDir, `${appName}.desktop`);

    if (enable) {
        if (!fs.existsSync(autostartDir)) {
            fs.mkdirSync(autostartDir, { recursive: true });
        }

        const desktopEntry = `[Desktop Entry]
                                Type=Application
                                Name=${appName}
                                Exec="${appPath}" --hidden
                                Terminal=false
                                Hidden=false`;

        fs.writeFileSync(desktopFile, desktopEntry);
    } else {
        if (fs.existsSync(desktopFile)) {
            fs.unlinkSync(desktopFile);
        }
    }
}

function setupMacAutoStart(enable: boolean) {
    app.setLoginItemSettings({
        openAtLogin: enable,
        path: app.getPath('exe'),
        args: ['--hidden']
    });
} 