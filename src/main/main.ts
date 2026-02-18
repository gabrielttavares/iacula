/**
 * Main Process Entry Point
 * Bootstrap do aplicativo Electron.
 * Responsável apenas por inicialização e coordenação.
 */

import { app, shell } from 'electron';
import { Container } from './bootstrap/Container';
import { TrayManager } from './bootstrap/TrayManager';
import { DockManager } from './bootstrap/DockManager';
import { TimerManager } from './bootstrap/TimerManager';
import { Settings } from '../domain/entities/Settings';
import { LiturgyHourModule } from '../application/dto/LiturgyHoursDTO';
import { buildIbreviaryOfficeUrl } from './liturgyOfficeUrl';

// Enable remote module
require('@electron/remote/main').initialize();

export class IaculaApp {
  private container: Container;
  private trayManager: TrayManager | null = null;
  private dockManager: DockManager | null = null;
  private timerManager: TimerManager | null = null;
  private currentSettings: Settings | null = null;
  private liturgyModuleTimers: Partial<Record<LiturgyHourModule, NodeJS.Timeout>> = {};
  private readonly initializationPromise: Promise<void>;

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

    // Setup IPC handlers
    this.setupIpc();

    // Start timers
    this.timerManager?.setup(this.currentSettings);

    this.setupLiturgyModuleTimers();

    // Preload liturgical season once at startup to reduce popup wait.
    await this.preloadLiturgicalSeason();

    // Show initial popup
    await this.showPopup();
    this.timerManager?.markFirstUnlockPopupShownToday();

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

  private setupIpc(): void {
    this.container.createIpcHandlers({
      onSettingsUpdated: (easterTimeChanged) => this.handleSettingsUpdated(easterTimeChanged),
      onCloseSettingsAndShowPopup: () => this.handleCloseSettingsAndShowPopup(),
      onOpenSettingsFromContent: () => this.handleOpenSettingsFromContent(),
      onOpenLiturgyOffice: (module) => this.handleOpenLiturgyOffice(module),
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

    this.setupLiturgyModuleTimers();
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
      this.container.windowService.close('liturgyReminder'),
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

  private setupLiturgyModuleTimers(): void {
    this.clearLiturgyModuleTimers();

    if (!this.currentSettings) {
      return;
    }

    const modules: Array<{ module: LiturgyHourModule; time: string }> = [];
    if (this.currentSettings.laudesEnabled) modules.push({ module: 'laudes', time: this.currentSettings.laudesTime });
    if (this.currentSettings.vespersEnabled) modules.push({ module: 'vespers', time: this.currentSettings.vespersTime });
    if (this.currentSettings.complineEnabled) modules.push({ module: 'compline', time: this.currentSettings.complineTime });
    if (this.currentSettings.oraMediaEnabled) modules.push({ module: 'ora_media', time: this.currentSettings.oraMediaTime });

    for (const config of modules) {
      this.scheduleNextLiturgyReminder(config.module, config.time);
    }
  }

  private clearLiturgyModuleTimers(): void {
    for (const timer of Object.values(this.liturgyModuleTimers)) {
      if (timer) {
        clearTimeout(timer);
      }
    }
    this.liturgyModuleTimers = {};
  }

  private scheduleNextLiturgyReminder(module: LiturgyHourModule, time: string): void {
    const next = this.getNextOccurrence(time);
    const delayMs = next.getTime() - Date.now();

    console.log(`[LiturgyHours] Scheduling ${module} reminder for ${next.toLocaleString()} (in ${(delayMs / 1000 / 60).toFixed(1)} min)`);

    this.liturgyModuleTimers[module] = setTimeout(async () => {
      await this.showLiturgyReminder(module);
      this.scheduleNextLiturgyReminder(module, time);
    }, delayMs);
  }

  private getNextOccurrence(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  private async showLiturgyReminder(module: LiturgyHourModule): Promise<void> {
    if (!this.currentSettings) {
      return;
    }

    this.container.setPreloadedLiturgyReminder({
      module,
      title: this.moduleTitle(module),
      summary: 'Ofício do dia.',
    });

    await this.container.windowService.show('liturgyReminder', {
      autoClose: true,
      autoCloseDelayMs: this.currentSettings.durationInMs,
    });
  }

  private async handleOpenLiturgyOffice(module: LiturgyHourModule): Promise<void> {
    const url = this.moduleOfficeUrl(module);
    try {
      await shell.openExternal(url);
      await this.container.windowService.close('liturgyReminder');
    } catch (error) {
      console.warn(`[LiturgyHours] Failed to open external office URL for ${module}: ${url}`, error);
    }
  }

  private moduleTitle(module: LiturgyHourModule): string {
    switch (module) {
      case 'laudes':
        return 'Laudes';
      case 'vespers':
        return 'Vésperas';
      case 'compline':
        return 'Completas';
      case 'ora_media':
        return 'Ora Media';
      default:
        return 'Liturgia das Horas';
    }
  }

  private moduleOfficeUrl(module: LiturgyHourModule): string {
    return buildIbreviaryOfficeUrl(module);
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
    await this.container.windowService.show('settings');
  }

  public async handleRelaunchRequest(): Promise<void> {
    await this.initializationPromise;
    console.log('[single-instance] Relaunch request received, opening settings window');

    await Promise.all([
      this.container.windowService.close('popup'),
      this.container.windowService.close('angelus'),
      this.container.windowService.close('reginaCaeli'),
      this.container.windowService.close('liturgyReminder'),
    ]);

    await this.showSettings();
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
    void iaculaApp.handleRelaunchRequest();
  });

  return iaculaApp;
}

// Initialize the application
if (!process.env.JEST_WORKER_ID) {
  bootstrapSingleInstance();
}
