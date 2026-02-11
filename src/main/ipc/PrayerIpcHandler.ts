/**
 * IPC Handler: Prayer
 * Handlers IPC para operações de orações.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { GetPrayerUseCase } from '../../application/use-cases/GetPrayerUseCase';

export class PrayerIpcHandler {
  constructor(private readonly getPrayerUseCase: GetPrayerUseCase) {}

  register(): void {
    ipcMain.handle(IPC_CHANNELS.GET_PRAYER, async (_event, args?: { forceEasterTime?: boolean }) => {
      return this.getPrayerUseCase.execute(args?.forceEasterTime);
    });
  }

  unregister(): void {
    ipcMain.removeHandler(IPC_CHANNELS.GET_PRAYER);
  }
}
