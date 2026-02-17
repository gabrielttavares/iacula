import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { LiturgyReminderDTO } from '../../application/dto/LiturgyHoursDTO';
import { addFadeInEffect, closeWindow } from '../shared/utils';

class LiturgyReminderController {
  private titleElement: HTMLElement | null = null;
  private summaryElement: HTMLElement | null = null;
  private openButton: HTMLElement | null = null;
  private closeButton: HTMLElement | null = null;
  private currentReminder: LiturgyReminderDTO | null = null;

  async initialize(): Promise<void> {
    this.bindElements();
    this.bindEvents();
    await this.loadReminder();
  }

  private bindElements(): void {
    this.titleElement = document.getElementById('module-title');
    this.summaryElement = document.getElementById('module-summary');
    this.openButton = document.getElementById('open-office-button');
    this.closeButton = document.getElementById('close-button');
  }

  private bindEvents(): void {
    this.closeButton?.addEventListener('click', () => {
      closeWindow();
    });

    this.openButton?.addEventListener('click', () => {
      if (!this.currentReminder) {
        closeWindow();
        return;
      }

      ipcRenderer.send(IPC_CHANNELS.OPEN_LITURGY_OFFICE, { module: this.currentReminder.module });
      closeWindow();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeWindow();
        return;
      }

      if (event.key === 'Enter') {
        this.openButton?.click();
      }
    });
  }

  private async loadReminder(): Promise<void> {
    const reminder = await ipcRenderer.invoke(IPC_CHANNELS.GET_PRELOADED_LITURGY_REMINDER) as LiturgyReminderDTO | null;
    this.currentReminder = reminder;

    if (!reminder) {
      if (this.titleElement) this.titleElement.textContent = 'Liturgia das Horas';
      if (this.summaryElement) this.summaryElement.textContent = 'Abre o ofício do dia.';
      addFadeInEffect();
      return;
    }

    if (this.titleElement) this.titleElement.textContent = reminder.title;
    if (this.summaryElement) this.summaryElement.textContent = reminder.summary;
    addFadeInEffect();
  }
}

window.addEventListener('load', () => {
  const controller = new LiturgyReminderController();
  controller.initialize();
});
