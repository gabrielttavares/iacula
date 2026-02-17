/**
 * Bootstrap: TrayManager
 * Gerencia o ícone na bandejá do sistema.
 */

import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';

export interface TrayCallbacks {
  onShowPopup: () => void;
  onShowAngelus: () => void;
  onShowReginaCaeli: () => void;
  onShowSettings: () => void;
}

export class TrayManager {
  private tray: Tray | null = null;

  constructor(private readonly callbacks: TrayCallbacks) {}

  create(): void {
    const iconPath = this.getIconPath();
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

    this.tray = new Tray(trayIcon);
    this.tray.setToolTip('Iacula');
    this.tray.setContextMenu(this.createContextMenu());
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  private getIconPath(): string {
    const platform = process.platform;
    const basePath = path.join(__dirname, '../../assets/images');

    if (platform === 'win32') {
      return path.join(basePath, 'icon.ico');
    } else if (platform === 'darwin') {
      return path.join(basePath, 'icon.icns');
    }
    return path.join(basePath, 'icon.png');
  }

  private createContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Mostrar jáculatoria',
        click: () => this.callbacks.onShowPopup(),
      },
      {
        label: 'Mostrar Angelus',
        click: () => this.callbacks.onShowAngelus(),
      },
      {
        label: 'Mostrar Regina Caeli (Tempo Pascal)',
        click: () => this.callbacks.onShowReginaCaeli(),
      },
      { type: 'separator' },
      {
        label: 'Configurações',
        click: () => this.callbacks.onShowSettings(),
      },
      { type: 'separator' },
      {
        label: 'Sair',
        click: () => app.quit(),
      },
    ]);
  }
}
