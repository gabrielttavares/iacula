/**
 * Presentation: Popup Controller
 * Controller para a janela de popup/jaculatória.
 * Sem lógica de negócio - apenas comunicação via IPC.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { QuoteDTO } from '../../application/dto/QuoteDTO';
import { closeWindow, addFadeInEffect } from '../shared/utils';

class PopupController {
  private quoteElement: HTMLElement | null = null;
  private imageElement: HTMLImageElement | null = null;
  private closeButton: HTMLElement | null = null;

  async initialize(): Promise<void> {
    this.bindElements();
    this.bindEvents();
    await this.loadContent();
  }

  private bindElements(): void {
    this.quoteElement = document.getElementById('daily-quote');
    this.imageElement = document.getElementById('daily-image') as HTMLImageElement;
    this.closeButton = document.getElementById('close-button');
  }

  private bindEvents(): void {
    this.closeButton?.addEventListener('click', closeWindow);
  }

  private async loadContent(): Promise<void> {
    try {
      const quote = await ipcRenderer.invoke(IPC_CHANNELS.GET_QUOTE) as QuoteDTO;

      if (this.quoteElement) {
        this.quoteElement.textContent = quote.text;
      }

      if (this.imageElement && quote.imagePath) {
        this.imageElement.src = quote.imagePath;
      }

      addFadeInEffect();
    } catch (error) {
      console.error('Error loading popup content:', error);
    }
  }
}

// Initialize when DOM is ready
window.addEventListener('load', () => {
  const controller = new PopupController();
  controller.initialize();
});
