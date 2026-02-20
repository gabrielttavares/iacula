/**
 * IPC Handler: System
 * Handlers IPC para operações de sistema.
 */

import { ipcMain, IpcMainEvent, app } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';

export interface SystemIpcHandlerCallbacks {
  onCloseSettingsAndShowPopup: () => void;
  onOpenSettingsFromContent: () => void;
}

export class SystemIpcHandler {
  constructor(private readonly callbacks: SystemIpcHandlerCallbacks) {}

  register(): void {
    // Sync handler for user data path
    ipcMain.on(IPC_CHANNELS.GET_USER_DATA_PATH, (event: IpcMainEvent) => {
      event.returnValue = app.getPath('userData');
    });

    // Sync handler for app version
    ipcMain.on(IPC_CHANNELS.GET_APP_VERSION, (event: IpcMainEvent) => {
      event.returnValue = app.getVersion();
    });

    // Handler for close settings and show popup
    ipcMain.on(IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP, () => {
      this.callbacks.onCloseSettingsAndShowPopup();
    });

    // Handler for opening settings from popup/prayer content
    ipcMain.on(IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT, () => {
      this.callbacks.onOpenSettingsFromContent();
    });
  }

  unregister(): void {
    ipcMain.removeAllListeners(IPC_CHANNELS.GET_USER_DATA_PATH);
    ipcMain.removeAllListeners(IPC_CHANNELS.GET_APP_VERSION);
    ipcMain.removeAllListeners(IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP);
    ipcMain.removeAllListeners(IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT);
  }
}
