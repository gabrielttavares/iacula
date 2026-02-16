/**
 * Bootstrap: DockManager
 * Gerencia a visibilidade do Dock no macOS.
 * Para menu bar apps, esconde o icone do Dock.
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

  constructor(private readonly callbacks: DockCallbacks) {
    this.isMac = process.platform === 'darwin';
  }

  setup(): void {
    if (!this.isMac) return;
    // LSUIElement in Info.plist handles dock visibility
    console.log('[dock] LSUIElement handles dock visibility');
  }
}
