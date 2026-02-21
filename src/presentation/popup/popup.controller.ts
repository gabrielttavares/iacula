/**
 * Presentation: Popup Controller
 * Controller para a janela de popup/jaculatória.
 * Sem lógica de negócio - apenas comunicação via IPC.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { QuoteDTO } from '../../application/dto/QuoteDTO';
import { closeWindow, addFadeInEffect, openSettingsFromContent } from '../shared/utils';

class PopupController {
  private quoteElement: HTMLElement | null = null;
  private imageElement: HTMLImageElement | null = null;
  private settingsButton: HTMLElement | null = null;
  private closeButton: HTMLElement | null = null;

  async initialize(): Promise<void> {
    this.bindElements();
    this.bindEvents();
    await this.loadContent();
  }

  private bindElements(): void {
    this.quoteElement = document.getElementById('daily-quote');
    this.imageElement = document.getElementById('daily-image') as HTMLImageElement;
    this.settingsButton = document.getElementById('settings-button');
    this.closeButton = document.getElementById('close-button');
  }

  private bindEvents(): void {
    this.closeButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      closeWindow();
    });
    this.settingsButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      openSettingsFromContent();
    });
  }

  private async loadContent(): Promise<void> {
    document.body.classList.add('loading');

    try {
      const preloadedQuote = await ipcRenderer.invoke(IPC_CHANNELS.GET_PRELOADED_QUOTE) as QuoteDTO | null;
      const quote = preloadedQuote ?? await ipcRenderer.invoke(IPC_CHANNELS.GET_QUOTE) as QuoteDTO;

      if (this.quoteElement) {
        this.quoteElement.textContent = quote.text;
      }

      const seasonLabel = document.getElementById('season-label');
      if (seasonLabel) {
        const seasonMap: Record<string, string> = {
          ordinary: 'tempo comum',
          advent: 'tempo do advento',
          lent: 'tempo da quaresma',
          easter: 'tempo pascal',
          christmas: 'tempo do natal',
        };
        seasonLabel.textContent = quote.feastName ?? seasonMap[quote.season] ?? '';
      }

      if (this.imageElement && quote.imagePath) {
        this.imageElement.src = quote.imagePath;
      }

      addFadeInEffect();
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
    } catch (error) {
      console.error('Error loading popup content:', error);
      document.body.classList.remove('loading');
    }
  }
}

// Initialize when DOM is ready
window.addEventListener('load', () => {
  const controller = new PopupController();
  controller.initialize();
});
