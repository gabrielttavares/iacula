/**
 * Presentation: Angelus Controller
 * Controller para a janela do Angelus.
 * Sem lógica de negócio - apenas comunicação via IPC.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { PrayerDTO } from '../../application/dto/PrayerDTO';
import { closeWindow, addFadeInEffect } from '../shared/utils';

class AngelusController {
  private titleElement: HTMLElement | null = null;
  private versesContainer: HTMLElement | null = null;
  private finalPrayerElement: HTMLElement | null = null;
  private imageElement: HTMLImageElement | null = null;
  private closeButton: HTMLElement | null = null;

  async initialize(): Promise<void> {
    this.bindElements();
    this.bindEvents();
    await this.loadContent();
  }

  private bindElements(): void {
    this.titleElement = document.getElementById('prayer-title');
    this.versesContainer = document.getElementById('verses-container');
    this.finalPrayerElement = document.getElementById('final-prayer');
    this.imageElement = document.getElementById('angelus-image') as HTMLImageElement;
    this.closeButton = document.getElementById('close-button');
  }

  private bindEvents(): void {
    this.closeButton?.addEventListener('click', closeWindow);
  }

  private async loadContent(): Promise<void> {
    try {
      const prayer = await ipcRenderer.invoke(IPC_CHANNELS.GET_PRAYER, { forceEasterTime: false }) as PrayerDTO;

      this.renderPrayer(prayer);
      addFadeInEffect();
    } catch (error) {
      console.error('Error loading Angelus content:', error);
    }
  }

  private renderPrayer(prayer: PrayerDTO): void {
    if (this.titleElement) {
      this.titleElement.textContent = prayer.title;
    }

    if (this.imageElement && prayer.imagePath) {
      this.imageElement.src = prayer.imagePath;
    }

    if (this.versesContainer) {
      this.versesContainer.innerHTML = '';

      prayer.verses.forEach(verse => {
        const verseElement = document.createElement('p');
        verseElement.className = 'verse';
        verseElement.textContent = verse.verse;

        const responseElement = document.createElement('p');
        responseElement.className = 'response';
        responseElement.textContent = verse.response;

        this.versesContainer?.appendChild(verseElement);
        this.versesContainer?.appendChild(responseElement);
      });
    }

    if (this.finalPrayerElement) {
      this.finalPrayerElement.textContent = prayer.prayer;
    }
  }
}

// Initialize when DOM is ready
window.addEventListener('load', () => {
  const controller = new AngelusController();
  controller.initialize();
});
