/**
 * Presentation: Settings Controller
 * Controller para a janela de configurações.
 * Sem lógica de negócio - apenas comunicação via IPC.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { SettingsDTO, UpdateSettingsDTO } from '../../application/dto/SettingsDTO';

class SettingsController {
  private form: HTMLFormElement | null = null;
  private intervalInput: HTMLInputElement | null = null;
  private durationInput: HTMLInputElement | null = null;
  private autostartCheckbox: HTMLInputElement | null = null;
  private easterTimeCheckbox: HTMLInputElement | null = null;
  private languageSelect: HTMLSelectElement | null = null;
  private statusElement: HTMLElement | null = null;

  async initialize(): Promise<void> {
    this.bindElements();
    this.bindEvents();
    await this.loadSettings();
  }

  private bindElements(): void {
    this.form = document.getElementById('settings-form') as HTMLFormElement;
    this.intervalInput = document.getElementById('interval') as HTMLInputElement;
    this.durationInput = document.getElementById('duration') as HTMLInputElement;
    this.autostartCheckbox = document.getElementById('autostart') as HTMLInputElement;
    this.easterTimeCheckbox = document.getElementById('easterTime') as HTMLInputElement;
    this.languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    this.statusElement = document.getElementById('status');
  }

  private bindEvents(): void {
    this.form?.addEventListener('submit', (e) => this.handleSubmit(e));

    ipcRenderer.on(IPC_CHANNELS.SETTINGS_SAVED, (_event, success: boolean) => {
      this.handleSaveResponse(success);
    });
  }

  private async loadSettings(): Promise<void> {
    try {
      console.log('Requesting settings...');
      const settings = await ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG) as SettingsDTO;
      console.log('Settings received:', settings);

      if (settings) {
        // Use default values if properties are missing or undefined
        const interval = settings.interval !== undefined ? settings.interval : 15;
        const duration = settings.duration !== undefined ? settings.duration : 10;
        const autostart = settings.autostart !== undefined ? settings.autostart : true;
        const easterTime = settings.easterTime !== undefined ? settings.easterTime : false;
        const language = settings.language || 'pt-br';

        if (this.intervalInput) this.intervalInput.value = interval.toString();
        if (this.durationInput) this.durationInput.value = duration.toString();
        if (this.autostartCheckbox) this.autostartCheckbox.checked = autostart;
        if (this.easterTimeCheckbox) this.easterTimeCheckbox.checked = easterTime;
        if (this.languageSelect) this.languageSelect.value = language;
      } else {
        console.warn('Settings received were null/undefined, applying defaults');
        this.applyDefaults();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.applyDefaults();
    }
  }

  private applyDefaults(): void {
    if (this.intervalInput) this.intervalInput.value = '15';
    if (this.durationInput) this.durationInput.value = '10';
    if (this.autostartCheckbox) this.autostartCheckbox.checked = true;
    if (this.easterTimeCheckbox) this.easterTimeCheckbox.checked = false;
    if (this.languageSelect) this.languageSelect.value = 'pt-br';
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    const settings: UpdateSettingsDTO = {
      interval: parseInt(this.intervalInput?.value || '15', 10),
      duration: parseInt(this.durationInput?.value || '10', 10),
      autostart: this.autostartCheckbox?.checked ?? true,
      easterTime: this.easterTimeCheckbox?.checked ?? false,
      language: this.languageSelect?.value || 'pt-br',
    };

    // Validate
    if (settings.interval! < 1 || settings.interval! > 60) {
      this.showStatus('O intervalo deve estar entre 1 e 60 minutos', 'error');
      return;
    }

    if (settings.duration! < 5 || settings.duration! > 30) {
      this.showStatus('A duracao deve estar entre 5 e 30 segundos', 'error');
      return;
    }

    ipcRenderer.send(IPC_CHANNELS.SAVE_SETTINGS, settings);
  }

  private handleSaveResponse(success: boolean): void {
    if (success) {
      this.showStatus('Configuracoes salvas com sucesso!', 'success');
      ipcRenderer.send(IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP);
    } else {
      this.showStatus('Erro ao salvar configuracoes', 'error');
    }
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    if (!this.statusElement) return;

    this.statusElement.textContent = message;
    this.statusElement.className = `status ${type}`;
    this.statusElement.style.display = 'block';

    setTimeout(() => {
      if (this.statusElement) {
        this.statusElement.style.display = 'none';
      }
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const controller = new SettingsController();
  controller.initialize();
});
