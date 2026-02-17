/**
 * Infrastructure: WindowService
 * Implementação concreta de IWindowService para Electron.
 */

import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { IWindowService, WindowType, WindowOptions } from '../../application/ports/IWindowService';

interface WindowConfig {
  width: number;
  height: number;
  htmlFile: string;
}

const FADE_OUT_DURATION_MS = 700;

const WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
  popup: {
    width: 220,
    height: 300,
    htmlFile: 'popup/popup.html',
  },
  angelus: {
    width: 320,
    height: 740,
    htmlFile: 'angelus/angelus.html',
  },
  reginaCaeli: {
    width: 320,
    height: 740,
    htmlFile: 'regina-caeli/reginaCaeli.html',
  },
  settings: {
    width: 500,
    height: 720,
    htmlFile: 'settings/settings.html',
  },
  liturgyReminder: {
    width: 240,
    height: 165,
    htmlFile: 'liturgy-reminder/liturgyReminder.html',
  },
};

export class WindowService implements IWindowService {
  private windows: Map<WindowType, BrowserWindow> = new Map();
  private closeTimers: Map<WindowType, NodeJS.Timeout> = new Map();
  private readonly rendererPath: string;
  private readonly isMac: boolean;

  constructor(rendererPath: string) {
    this.rendererPath = rendererPath;
    this.isMac = process.platform === 'darwin';
  }

  async show(type: WindowType, options?: WindowOptions): Promise<void> {
    // Close existing window of same type
    await this.close(type);

    const config = WINDOW_CONFIGS[type];
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const windowWidth = options?.width ?? config.width;
    const windowHeight = options?.height ?? config.height;

    const isPopupType = type === 'popup' || type === 'angelus' || type === 'reginaCaeli' || type === 'liturgyReminder';
    const isFocusableWindow = type === 'settings' || type === 'popup' || type === 'liturgyReminder';

    const window = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: isPopupType ? width - windowWidth : undefined,
      y: isPopupType ? height - windowHeight : undefined,
      frame: !isPopupType,
      transparent: isPopupType,
      alwaysOnTop: isPopupType,
      show: false,
      focusable: isFocusableWindow,
      skipTaskbar: isPopupType,
      backgroundColor: '#00000000', // Fully transparent
      hasShadow: false, // Disable native shadow
      roundedCorners: true,
      titleBarStyle: isPopupType ? 'hidden' : undefined,
      resizable: !isPopupType,
      useContentSize: true, // Ensure content size matches window size exactly
      visualEffectState: 'active', // Ensure vibrancy works even when window is inactive
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Enable remote module
    try {
      require('@electron/remote/main').enable(window.webContents);
    } catch {
      // remote module not available
    }

    // Apply Mac-specific tweaks for popup windows
    if (this.isMac && isPopupType) {
      this.applyMacTweaks(window);
    } else if (isPopupType) {
        // Ensure transparency on Windows/Linux
        window.setBackgroundColor('#00000000');
    }

    const htmlPath = path.join(this.rendererPath, config.htmlFile);
    await window.loadFile(htmlPath);

    // Show window
    if (isPopupType) {
      window.showInactive();
    } else {
      window.show();
    }

    this.windows.set(type, window);

    // Handle window close event
    window.on('closed', () => {
      this.windows.delete(type);
      this.clearCloseTimer(type);
    });

    // Setup auto-close if specified
    if (options?.autoClose && options.autoCloseDelayMs) {
      this.setupAutoClose(type, options.autoCloseDelayMs);
    }
  }

  async close(type: WindowType): Promise<void> {
    this.clearCloseTimer(type);

    const window = this.windows.get(type);
    if (window && !window.isDestroyed()) {
      window.destroy();
    }
    this.windows.delete(type);
  }

  async closeAll(): Promise<void> {
    const types = Array.from(this.windows.keys());
    await Promise.all(types.map(type => this.close(type)));
  }

  isOpen(type: WindowType): boolean {
    const window = this.windows.get(type);
    return window !== undefined && !window.isDestroyed();
  }

  private applyMacTweaks(window: BrowserWindow): void {
    // Vibrancy removed to avoid rectangular background behind rounded corners
    // window.setVibrancy('under-window'); 
    window.setBackgroundColor('#00000000');
    window.setHasShadow(false);
    window.setWindowButtonVisibility(false);

    window.webContents.on('did-finish-load', () => {
      window.webContents.executeJavaScript(
        "document.documentElement.classList.add('mac');"
      );
    });
  }

  private setupAutoClose(type: WindowType, delayMs: number): void {
    this.clearCloseTimer(type);

    const timer = setTimeout(() => {
      this.closeWithFade(type).catch(() => {
        this.close(type);
      });
    }, delayMs);

    this.closeTimers.set(type, timer);
  }

  private async closeWithFade(type: WindowType): Promise<void> {
    const window = this.windows.get(type);

    if (!window || window.isDestroyed()) {
      return;
    }

    if (type === 'settings') {
      await this.close(type);
      return;
    }

    try {
      await window.webContents.executeJavaScript(`
        (() => {
          const body = document.body;
          if (!body) return;
          body.classList.remove('fade-in');
          body.classList.add('fade-out');
        })();
      `);
    } catch {
      await this.close(type);
      return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), FADE_OUT_DURATION_MS);
    });

    await this.close(type);
  }

  private clearCloseTimer(type: WindowType): void {
    const timer = this.closeTimers.get(type);
    if (timer) {
      clearTimeout(timer);
      this.closeTimers.delete(type);
    }
  }
}
