/**
 * Bootstrap: DockManager
 * Gerencia o menu do Dock no macOS.
 */

import { Menu, app } from 'electron';

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

    try {
      app.setActivationPolicy('regular');
      app.dock.show();
      console.log('[dock] policy=regular + show');
    } catch (e) {
      console.warn('[dock] activation/show warn', e);
    }

    this.createDockMenu();

    // Re-apply dock menu on certain events
    app.on('activate', () => {
      console.log('[dock] reapply on activate');
      this.createDockMenu();
    });

    app.on('browser-window-created', () => {
      console.log('[dock] reapply on window-created');
      this.createDockMenu();
    });
  }

  private createDockMenu(): void {
    if (!this.isMac) return;

    const dockMenu = Menu.buildFromTemplate([
      { label: 'Mostrar jaculatoria', click: () => this.callbacks.onShowPopup() },
      { label: 'Mostrar Angelus', click: () => this.callbacks.onShowAngelus() },
      { label: 'Mostrar Regina Caeli (Tempo Pascal)', click: () => this.callbacks.onShowReginaCaeli() },
      { type: 'separator' },
      { label: 'Configuracoes', click: () => this.callbacks.onShowSettings() },
    ]);

    try {
      console.log('[dock] setMenu start');
      app.dock.setMenu(dockMenu);
      console.log('[dock] setMenu done');
    } catch (e) {
      console.error('[dock] setMenu error', e);
    }
  }
}
