/**
 * Bootstrap: DockManager
 * Gerencia visibilidade do app no Dock no macOS.
 */

import { app } from 'electron';

export interface DockCallbacks {
  onShowPopup: () => void;
  onShowAngelus: () => void;
  onShowReginaCaeli: () => void;
  onShowSettings: () => void;
}

export class DockManager {
  private readonly isMac: boolean;

  constructor(_callbacks: DockCallbacks) {
    this.isMac = process.platform === 'darwin';
  }

  setup(): void {
    if (!this.isMac) return;

    try {
      app.setActivationPolicy('accessory');
      app.dock.hide();
      console.log('[dock] policy=accessory + hidden');
    } catch (e) {
      console.warn('[dock] activation/hide warn', e);
    }
  }
}
