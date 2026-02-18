import { app, dialog, MessageBoxOptions, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';

const DEFAULT_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

interface UpdaterLike {
  autoDownload: boolean;
  autoInstallOnAppQuit: boolean;
  checkForUpdates: () => Promise<unknown> | unknown;
  downloadUpdate: () => Promise<unknown> | unknown;
  quitAndInstall: () => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

interface UpdateManagerOptions {
  isPackaged?: boolean;
  checkIntervalMs?: number;
  updater?: UpdaterLike;
}

export class UpdateManager {
  private readonly isPackaged: boolean;
  private readonly checkIntervalMs: number;
  private readonly updater: UpdaterLike;
  private checkTimer: NodeJS.Timeout | null = null;
  private started = false;

  private readonly onUpdateAvailableHandler = () => {
    this.handleUpdateAvailable();
  };

  private readonly onUpdateDownloadedHandler = () => {
    this.handleUpdateDownloaded();
  };

  private readonly onErrorHandler = () => {
    this.notify('Falha na atualização', 'Não foi possível verificar ou baixar a atualização agora.');
  };

  constructor(options: UpdateManagerOptions = {}) {
    this.isPackaged = options.isPackaged ?? app.isPackaged;
    this.checkIntervalMs = options.checkIntervalMs ?? DEFAULT_CHECK_INTERVAL_MS;
    this.updater = options.updater ?? autoUpdater;
  }

  start(): void {
    if (this.started || !this.isPackaged) {
      return;
    }

    this.started = true;
    this.configureUpdater();
    this.registerHandlers();
    this.checkForUpdates();
    this.checkTimer = setInterval(() => this.checkForUpdates(), this.checkIntervalMs);
  }

  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    this.detachHandler('update-available', this.onUpdateAvailableHandler);
    this.detachHandler('update-downloaded', this.onUpdateDownloadedHandler);
    this.detachHandler('error', this.onErrorHandler);
    this.started = false;
  }

  private configureUpdater(): void {
    this.updater.autoDownload = false;
    this.updater.autoInstallOnAppQuit = false;
  }

  private registerHandlers(): void {
    this.updater.on('update-available', this.onUpdateAvailableHandler);
    this.updater.on('update-downloaded', this.onUpdateDownloadedHandler);
    this.updater.on('error', this.onErrorHandler);
  }

  private detachHandler(event: string, listener: (...args: unknown[]) => void): void {
    if (this.updater.off) {
      this.updater.off(event, listener);
      return;
    }

    this.updater.removeListener?.(event, listener);
  }

  private async checkForUpdates(): Promise<void> {
    try {
      await Promise.resolve(this.updater.checkForUpdates());
    } catch {
      this.notify('Falha na atualização', 'Não foi possível verificar ou baixar a atualização agora.');
    }
  }

  private async handleUpdateAvailable(): Promise<void> {
    this.notify('Atualização disponível', 'Uma nova versão do Iacula está disponível.');

    const shouldDownload = await this.ask({
      type: 'info',
      title: 'Atualização disponível',
      message: 'Uma nova versão do Iacula está disponível. Deseja baixar agora?',
      buttons: ['Baixar agora', 'Depois'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    });

    if (!shouldDownload) {
      return;
    }

    try {
      await Promise.resolve(this.updater.downloadUpdate());
    } catch {
      this.notify('Falha na atualização', 'Não foi possível verificar ou baixar a atualização agora.');
    }
  }

  private async handleUpdateDownloaded(): Promise<void> {
    const shouldInstallNow = await this.ask({
      type: 'info',
      title: 'Atualização pronta para instalar',
      message: 'A atualização foi baixada com sucesso. Deseja instalar agora?',
      buttons: ['Instalar agora', 'Depois'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    });

    if (shouldInstallNow) {
      this.updater.quitAndInstall();
    }
  }

  private async ask(options: MessageBoxOptions): Promise<boolean> {
    const result = await dialog.showMessageBox(options);
    return result.response === 0;
  }

  private notify(title: string, body: string): void {
    try {
      const supported = typeof (Notification as unknown as { isSupported?: () => boolean }).isSupported === 'function'
        ? (Notification as unknown as { isSupported: () => boolean }).isSupported()
        : true;

      if (!supported) {
        return;
      }

      const notification = new Notification({ title, body });
      notification.show();
    } catch {
      // Ignore notification failures to avoid impacting core app flow.
    }
  }
}
