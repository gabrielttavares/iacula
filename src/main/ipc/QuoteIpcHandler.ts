/**
 * IPC Handler: Quote
 * Handlers IPC para operações de jaculatórias/citações.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { GetNextQuoteUseCase } from '../../application/use-cases/GetNextQuoteUseCase';

export class QuoteIpcHandler {
  constructor(private readonly getNextQuoteUseCase: GetNextQuoteUseCase) {}

  register(): void {
    ipcMain.handle(IPC_CHANNELS.GET_QUOTE, async () => {
      return this.getNextQuoteUseCase.execute();
    });
  }

  unregister(): void {
    ipcMain.removeHandler(IPC_CHANNELS.GET_QUOTE);
  }
}
