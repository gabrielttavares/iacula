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
      console.log('[QuoteIpcHandler] Received GET_QUOTE request');
      try {
        const result = await this.getNextQuoteUseCase.execute();
        console.log('[QuoteIpcHandler] Returning quote:', result);
        return result;
      } catch (error) {
        console.error('[QuoteIpcHandler] Error getting quote:', error);
        throw error;
      }
    });
  }

  unregister(): void {
    ipcMain.removeHandler(IPC_CHANNELS.GET_QUOTE);
  }
}
