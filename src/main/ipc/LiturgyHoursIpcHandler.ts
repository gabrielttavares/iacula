import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { LiturgyHourModule, LiturgyReminderDTO } from '../../application/dto/LiturgyHoursDTO';

export interface LiturgyHoursIpcHandlerCallbacks {
  onOpenLiturgyOffice: (module: LiturgyHourModule) => void;
}

export class LiturgyHoursIpcHandler {
  private preloadedReminder: LiturgyReminderDTO | null = null;

  constructor(private readonly callbacks: LiturgyHoursIpcHandlerCallbacks) {}

  setPreloadedReminder(reminder: LiturgyReminderDTO): void {
    this.preloadedReminder = reminder;
  }

  register(): void {
    ipcMain.handle(IPC_CHANNELS.GET_PRELOADED_LITURGY_REMINDER, async () => {
      return this.preloadedReminder;
    });

    ipcMain.on(IPC_CHANNELS.OPEN_LITURGY_OFFICE, (_event, payload: { module: LiturgyHourModule }) => {
      this.callbacks.onOpenLiturgyOffice(payload.module);
    });
  }

  unregister(): void {
    ipcMain.removeHandler(IPC_CHANNELS.GET_PRELOADED_LITURGY_REMINDER);
    ipcMain.removeAllListeners(IPC_CHANNELS.OPEN_LITURGY_OFFICE);
  }
}
