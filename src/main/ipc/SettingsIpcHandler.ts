/**
 * IPC Handler: Settings
 * Handlers IPC para operações de configurações.
 */

import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { GetSettingsUseCase } from '../../application/use-cases/GetSettingsUseCase';
import { UpdateSettingsUseCase } from '../../application/use-cases/UpdateSettingsUseCase';
import { UpdateSettingsDTO } from '../../application/dto/SettingsDTO';

export interface SettingsIpcHandlerCallbacks {
  onSettingsUpdated: (easterTimeChanged: boolean) => void;
}

export class SettingsIpcHandler {
  constructor(
    private readonly getSettingsUseCase: GetSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly callbacks: SettingsIpcHandlerCallbacks
  ) {}

  register(): void {
    // Handle get-config (invoke)
    ipcMain.handle(IPC_CHANNELS.GET_CONFIG, async () => {
      return this.getSettingsUseCase.execute();
    });

    // Handle save-settings (send/on)
    ipcMain.on(IPC_CHANNELS.SAVE_SETTINGS, async (event: IpcMainEvent, settings: UpdateSettingsDTO) => {
      try {
        console.log('Saving new settings:', settings);
        const result = await this.updateSettingsUseCase.execute(settings);

        event.reply(IPC_CHANNELS.SETTINGS_SAVED, result.success);

        if (result.success) {
          this.callbacks.onSettingsUpdated(result.easterTimeChanged);
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        event.reply(IPC_CHANNELS.SETTINGS_SAVED, false);
      }
    });
  }

  unregister(): void {
    ipcMain.removeHandler(IPC_CHANNELS.GET_CONFIG);
    ipcMain.removeAllListeners(IPC_CHANNELS.SAVE_SETTINGS);
  }
}
