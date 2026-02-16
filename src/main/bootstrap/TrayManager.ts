/**
 * Bootstrap: TrayManager
 * Gerencia o icone na bandeja do sistema (menu bar no macOS).
 */

import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import fs from 'fs';

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
    try {
      const iconPath = this.getIconPath();
      console.log('[tray] icon path:', iconPath);
      console.log('[tray] file exists:', fs.existsSync(iconPath));

      let icon = nativeImage.createFromPath(iconPath);
      console.log('[tray] image empty:', icon.isEmpty());
      console.log('[tray] image size:', icon.getSize());

      if (icon.isEmpty()) {
        console.warn('[tray] icon is empty, using fallback');
        icon = this.createFallbackIcon();
      }

      // Resize to proper tray size
      icon = icon.resize({ width: 16, height: 16 });

      // Mark as template image for macOS (auto color inversion)
      if (process.platform === 'darwin') {
        icon.setTemplateImage(true);
      }

      this.tray = new Tray(icon);
      this.tray.setToolTip('Iacula');
      this.tray.setContextMenu(this.createContextMenu());
      
      // Debug: check if tray has bounds (indicates it's rendered)
      const bounds = this.tray.getBounds();
      console.log('[tray] created successfully');
      console.log('[tray] bounds:', bounds);
      console.log('[tray] isDestroyed:', this.tray.isDestroyed());
    } catch (e) {
      console.error('[tray] creation failed:', e);
    }
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  private getIconPath(): string {
    const platform = process.platform;
    const isDev = !app.isPackaged;

    if (platform === 'darwin') {
      if (isDev) {
        // Dev mode: use project assets directly
        return path.join(app.getAppPath(), 'assets/images/iconTemplate.png');
      }
      // Production: use extraResources
      return path.join(process.resourcesPath, 'assets/images/iconTemplate.png');
    }

    // Windows/Linux: dist/assets/images copiado pelo copy-assets.js
    const basePath = path.join(__dirname, '../../assets/images');
    if (platform === 'win32') {
      return path.join(basePath, 'icon.ico');
    }
    return path.join(basePath, 'icon.png');
  }

  private createFallbackIcon(): Electron.NativeImage {
    // 16x16 black filled circle PNG, base64 encoded
    // This is a simple black dot that will be visible in the menu bar
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAaklEQVQ4T2NkoBAwUqifYdQAhtEwGPAw+P//PwMjIyMDAwMDw////xn+//8PYjMwMDAwgNgMDAwMYDYDAwMDmA1iMzAwMIDZIDYDA8P/////MzAw/P8PYv///5+BgeH/fxCb4f9/BoaRHgYAVvMnEXvOZHoAAAAASUVORK5CYII=';
    return nativeImage.createFromDataURL(`data:image/png;base64,${base64}`);
  }

  private createContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Mostrar jaculatoria',
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
        label: 'Configuracoes',
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
