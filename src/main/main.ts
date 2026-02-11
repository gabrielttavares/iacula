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
import { Settings } from '../domain/entities/Settings';

// Enable remote module
require('@electron/remote/main').initialize();

class IaculaApp {
  private container: Container;
  private trayManager: TrayManager | null = null;
  private dockManager: DockManager | null = null;
  private timerManager: TimerManager | null = null;
  private currentSettings: Settings | null = null;

  constructor() {
    this.container = new Container();
    this.initialize();
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

    // Show initial popup
    await this.showPopup();

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
    });
  }

  private setupIpc(): void {
    this.container.createIpcHandlers({
      onSettingsUpdated: (easterTimeChanged) => this.handleSettingsUpdated(easterTimeChanged),
      onCloseSettingsAndShowPopup: () => this.handleCloseSettingsAndShowPopup(),
    });

    this.container.registerIpcHandlers();
  }

  private async handleSettingsUpdated(easterTimeChanged: boolean): Promise<void> {
    console.log('Settings updated, easterTimeChanged:', easterTimeChanged);

    // Reload settings
    this.currentSettings = await this.loadSettings();

    // Update timers
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

  private async showPopup(): Promise<void> {
    if (!this.currentSettings) return;

    await this.container.windowService.show('popup', {
      autoClose: true,
      autoCloseDelayMs: this.currentSettings.durationInMs,
    });
  }

  private async showAngelus(forceEasterTime?: boolean): Promise<void> {
    const isEasterTime = forceEasterTime ?? this.currentSettings?.easterTime ?? false;
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
}

// Initialize the application
new IaculaApp();
