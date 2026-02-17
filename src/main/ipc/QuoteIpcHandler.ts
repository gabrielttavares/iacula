/**
 * IPC Handler: Quote
 * Handlers IPC para operações de jaculatórias/citações.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { GetNextQuoteUseCase } from '../../application/use-cases/GetNextQuoteUseCase';
import { QuoteDTO } from '../../application/dto/QuoteDTO';

export class QuoteIpcHandler {
  private preloadedQuote: QuoteDTO | null = null;

  constructor(private readonly getNextQuoteUseCase: GetNextQuoteUseCase) {}

  setPreloadedQuote(quote: QuoteDTO): void {
    this.preloadedQuote = quote;
  }

  register(): void {
    ipcMain.handle(IPC_CHANNELS.GET_PRELOADED_QUOTE, async () => {
      const quote = this.preloadedQuote;
      this.preloadedQuote = null;
      return quote;
    });

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
    ipcMain.removeHandler(IPC_CHANNELS.GET_PRELOADED_QUOTE);
    ipcMain.removeHandler(IPC_CHANNELS.GET_QUOTE);
  }
}
