/**
 * Main Process Entry Point
 * Bootstrap do aplicativo Electron.
 * Responsável apenas por inicialização e coordenação.
 */

import { app } from 'electron';
import { Container } from './bootstrap/Container';
import { TrayManager } from './bootstrap/TrayManager';
import { DockManager } from './bootstrap/DockManager';
import { TimerManager } from './bootstrap/TimerManager';
import { UpdateManager } from './bootstrap/UpdateManager';
import { Settings } from '../domain/entities/Settings';

// Enable remote module
require('@electron/remote/main').initialize();

const ACTIVATE_RELAUNCH_MIN_DELAY_MS = 1500;

export class IaculaApp {
  private container: Container;
  private trayManager: TrayManager | null = null;
  private dockManager: DockManager | null = null;
  private timerManager: TimerManager | null = null;
  private updateManager: UpdateManager | null = null;
  private currentSettings: Settings | null = null;
  private readonly initializationPromise: Promise<void>;
  private initializedAtMs: number | null = null;

  constructor(container?: Container, autoInitialize = true) {
    this.container = container ?? new Container();
    this.initializationPromise = autoInitialize ? this.initialize() : Promise.resolve();
  }

  private async initialize(): Promise<void> {
    await app.whenReady();

    // Load initial settings
    this.currentSettings = await this.loadSettings();
    this.logSettings();

    // Setup managers
    this.setupManagers();
    this.enforceMacAccessoryMode('initialize');

    // Setup IPC handlers
    this.setupIpc();

    // Setup updater
    this.setupUpdater();

    // Start timers
    this.timerManager?.setup(this.currentSettings);

    // Preload liturgical season once at startup to reduce popup wait.
    await this.preloadLiturgicalSeason();

    // Show initial popup
    await this.showPopup();
    this.timerManager?.markFirstUnlockPopupShownToday();
    this.initializedAtMs = Date.now();

    // Handle window-all-closed
    app.on('window-all-closed', () => {
      // Keep app running in background
    });
  }

  private async loadSettings(): Promise<Settings> {
    const dto = await this.container.getSettingsUseCase.execute();
    return Settings.create(dto);
  }

  private logSettings(): void {
    if (!this.currentSettings) return;

    console.log('==================================');
    console.log('APP CONFIGURATION:');
    console.log('Interval:', this.currentSettings.interval, 'minutes');
    console.log('Duration:', this.currentSettings.duration, 'seconds');
    console.log('Autostart:', this.currentSettings.autostart);
    console.log('Easter Time (Tempo Pascal):', this.currentSettings.easterTime);
    console.log('==================================');
  }

  private setupManagers(): void {
    const callbacks = {
      onShowPopup: () => this.showPopup(),
      onShowAngelus: () => this.showAngelus(false),
      onShowReginaCaeli: () => this.showAngelus(true),
      onShowSettings: () => this.showSettings(),
    };

    // Tray Manager
    this.trayManager = new TrayManager(callbacks);
    this.trayManager.create();

    // Dock Manager (macOS only)
    this.dockManager = new DockManager(callbacks);
    this.dockManager.setup();

    // Timer Manager
    this.timerManager = new TimerManager({
      onPopupInterval: () => this.showPopup(),
      onAngelusTime: () => this.showAngelus(),
      onFirstUnlockOfDay: () => this.showPopup(),
    });
  }

  private setupUpdater(): void {
    this.updateManager = new UpdateManager();
    this.updateManager.start();
  }

  private setupIpc(): void {
    this.container.createIpcHandlers({
      onSettingsUpdated: (easterTimeChanged) => this.handleSettingsUpdated(easterTimeChanged),
      onCloseSettingsAndShowPopup: () => this.handleCloseSettingsAndShowPopup(),
      onOpenSettingsFromContent: () => this.handleOpenSettingsFromContent(),
    });

    this.container.registerIpcHandlers();
  }

  private async handleSettingsUpdated(easterTimeChanged: boolean): Promise<void> {
    console.log('Settings updatéd, easterTimeChanged:', easterTimeChanged);

    // Reload settings
    this.currentSettings = await this.loadSettings();

    // Updaté timers
    this.timerManager?.updateSettings(this.currentSettings);

    // Reset Angelus timer if easter time changed
    if (easterTimeChanged) {
      console.log('Easter time setting changed, resetting Angelus timer');
      this.timerManager?.resetAngelusTimer();
    }
  }

  private async handleCloseSettingsAndShowPopup(): Promise<void> {
    await this.container.windowService.close('settings');
    await this.showPopup();
  }

  private async handleOpenSettingsFromContent(): Promise<void> {
    await Promise.all([
      this.container.windowService.close('popup'),
      this.container.windowService.close('angelus'),
      this.container.windowService.close('reginaCaeli'),
    ]);

    await this.showSettings();
  }

  private async showPopup(): Promise<void> {
    if (!this.currentSettings) return;

    const quote = await this.container.getNextQuoteUseCase.execute();
    this.container.setPreloadedPopupQuote(quote);

    await this.container.windowService.show('popup', {
      autoClose: true,
      autoCloseDelayMs: this.currentSettings.durationInMs,
    });
  }

  private async preloadLiturgicalSeason(): Promise<void> {
    try {
      const season = await this.container.liturgicalSeasonService.getCurrentSeason();
      console.log(`[IaculaApp] Preloaded liturgical season: ${season}`);
    } catch (error) {
      console.warn('[IaculaApp] Failed to preload liturgical season, using fallback on demand.', error);
    }
  }

  private async showAngelus(forceEasterTime?: boolean): Promise<void> {
    const season = await this.container.liturgicalSeasonService.getCurrentSeason();
    const isEasterTime = forceEasterTime ?? season === 'easter';
    const windowType = isEasterTime ? 'reginaCaeli' : 'angelus';

    console.log(`Showing ${windowType} based on isEasterTime=${isEasterTime}`);

    await this.container.windowService.show(windowType, {
      autoClose: true,
      autoCloseDelayMs: 60 * 1000, // 1 minute
    });
  }

  private async showSettings(): Promise<void> {
    this.enforceMacAccessoryMode('show-settings');
    await this.container.windowService.show('settings');
  }

  public async handleRelaunchRequest(source: 'second-instance' | 'activate' = 'second-instance'): Promise<void> {
    await this.initializationPromise;
    if (source === 'activate') {
      if (!this.shouldHandleActivateRelaunch()) {
        console.log('[single-instance] activate ignored during startup stabilization window');
        return;
      }
    }
    this.enforceMacAccessoryMode(`relaunch-${source}`);
    console.log(`[single-instance] Relaunch request received via ${source}, opening settings window`);

    await Promise.all([
      this.container.windowService.close('popup'),
      this.container.windowService.close('angelus'),
      this.container.windowService.close('reginaCaeli'),
    ]);

    await this.showSettings();
  }

  private enforceMacAccessoryMode(context: string): void {
    if (process.platform !== 'darwin') {
      return;
    }

    try {
      app.setActivationPolicy('accessory');
      app.dock.hide();
      console.log(`[dock] enforced policy=accessory + hidden (${context})`);
    } catch (error) {
      console.warn(`[dock] failed to enforce accessory mode (${context})`, error);
    }
  }

  private shouldHandleActivateRelaunch(): boolean {
    if (this.initializedAtMs === null) {
      return false;
    }
    return Date.now() - this.initializedAtMs >= ACTIVATE_RELAUNCH_MIN_DELAY_MS;
  }
}

export function bootstrapSingleInstance(
  electronApp: Pick<typeof app, 'requestSingleInstanceLock' | 'quit' | 'on'> = app,
  createApp: () => IaculaApp = () => new IaculaApp(),
): IaculaApp | null {
  const hasSingleInstanceLock = electronApp.requestSingleInstanceLock();
  if (!hasSingleInstanceLock) {
    console.log('[single-instance] Secondary instance detected. Quitting this instance.');
    electronApp.quit();
    return null;
  }

  console.log('[single-instance] Primary instance lock acquired.');
  const iaculaApp = createApp();

  electronApp.on('second-instance', () => {
    void iaculaApp.handleRelaunchRequest('second-instance');
  });

  electronApp.on('activate', () => {
    void iaculaApp.handleRelaunchRequest('activate');
  });

  return iaculaApp;
}

// Initialize the application
if (!process.env.JEST_WORKER_ID) {
  bootstrapSingleInstance();
}
