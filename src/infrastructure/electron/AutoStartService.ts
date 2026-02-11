/**
 * Infrastructure: AutoStartService
 * Implementação concreta de IAutoStartService para Electron.
 */

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { IAutoStartService } from '../../application/ports/IAutoStartService';

export class AutoStartService implements IAutoStartService {
  private readonly platform: NodeJS.Platform;

  constructor() {
    this.platform = process.platform;
  }

  async setup(enable: boolean): Promise<void> {
    const appPath = app.getPath('exe');
    const appName = app.getName();

    switch (this.platform) {
      case 'win32':
        await this.setupWindows(enable, appPath, appName);
        break;
      case 'linux':
        await this.setupLinux(enable, appPath, appName);
        break;
      case 'darwin':
        await this.setupMac(enable);
        break;
    }
  }

  async isEnabled(): Promise<boolean> {
    if (this.platform === 'darwin') {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    }

    // For other platforms, check if the autostart file exists
    const appName = app.getName();

    if (this.platform === 'win32') {
      const startupFolder = path.join(
        process.env.APPDATA || '',
        'Microsoft',
        'Windows',
        'Start Menu',
        'Programs',
        'Startup'
      );
      const shortcutPath = path.join(startupFolder, `${appName}.lnk`);
      return fs.existsSync(shortcutPath);
    }

    if (this.platform === 'linux') {
      const autostartDir = path.join(process.env.HOME || '', '.config', 'autostart');
      const desktopFile = path.join(autostartDir, `${appName}.desktop`);
      return fs.existsSync(desktopFile);
    }

    return false;
  }

  private async setupWindows(enable: boolean, appPath: string, appName: string): Promise<void> {
    try {
      const squirrelStartup = require('electron-squirrel-startup');
      if (squirrelStartup) return;
    } catch {
      // electron-squirrel-startup not available
    }

    const startupFolder = path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'Startup'
    );
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

  private async setupLinux(enable: boolean, appPath: string, appName: string): Promise<void> {
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

  private async setupMac(enable: boolean): Promise<void> {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: app.getPath('exe'),
      args: ['--hidden'],
    });
  }
}
