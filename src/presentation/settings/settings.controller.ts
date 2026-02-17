/**
 * Presentation: Settings Controller
 * Controller para a jánela de configurações.
 * Sem lógica de negócio - apenas comunicação via IPC.
 */

import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';
import { SettingsDTO, UpdateSettingsDTO } from '../../application/dto/SettingsDTO';

const CLOSE_AFTER_SAVE_DELAY_MS = 700;

class SettingsController {
  private form: HTMLFormElement | null = null;
  private intervalInput: HTMLInputElement | null = null;
  private durationInput: HTMLInputElement | null = null;
  private autostartCheckbox: HTMLInputElement | null = null;
  private languageSelect: HTMLSelectElement | null = null;
  private laudesEnabledCheckbox: HTMLInputElement | null = null;
  private vespersEnabledCheckbox: HTMLInputElement | null = null;
  private complineEnabledCheckbox: HTMLInputElement | null = null;
  private oraMediaEnabledCheckbox: HTMLInputElement | null = null;
  private laudesTimeInput: HTMLInputElement | null = null;
  private vespersTimeInput: HTMLInputElement | null = null;
  private complineTimeInput: HTMLInputElement | null = null;
  private oraMediaTimeInput: HTMLInputElement | null = null;
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
    this.languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    this.laudesEnabledCheckbox = document.getElementById('laudes-enabled') as HTMLInputElement;
    this.vespersEnabledCheckbox = document.getElementById('vespers-enabled') as HTMLInputElement;
    this.complineEnabledCheckbox = document.getElementById('compline-enabled') as HTMLInputElement;
    this.oraMediaEnabledCheckbox = document.getElementById('ora-media-enabled') as HTMLInputElement;
    this.laudesTimeInput = document.getElementById('laudes-time') as HTMLInputElement;
    this.vespersTimeInput = document.getElementById('vespers-time') as HTMLInputElement;
    this.complineTimeInput = document.getElementById('compline-time') as HTMLInputElement;
    this.oraMediaTimeInput = document.getElementById('ora-media-time') as HTMLInputElement;
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
        const language = settings.language || 'pt-br';
        const laudesEnabled = settings.laudesEnabled !== undefined ? settings.laudesEnabled : false;
        const vespersEnabled = settings.vespersEnabled !== undefined ? settings.vespersEnabled : false;
        const complineEnabled = settings.complineEnabled !== undefined ? settings.complineEnabled : false;
        const oraMediaEnabled = settings.oraMediaEnabled !== undefined ? settings.oraMediaEnabled : false;
        const laudesTime = settings.laudesTime || '06:00';
        const vespersTime = settings.vespersTime || '18:00';
        const complineTime = settings.complineTime || '21:00';
        const oraMediaTime = settings.oraMediaTime || '12:30';

        if (this.intervalInput) this.intervalInput.value = interval.toString();
        if (this.durationInput) this.durationInput.value = duration.toString();
        if (this.autostartCheckbox) this.autostartCheckbox.checked = autostart;
        if (this.languageSelect) this.languageSelect.value = language;
        if (this.laudesEnabledCheckbox) this.laudesEnabledCheckbox.checked = laudesEnabled;
        if (this.vespersEnabledCheckbox) this.vespersEnabledCheckbox.checked = vespersEnabled;
        if (this.complineEnabledCheckbox) this.complineEnabledCheckbox.checked = complineEnabled;
        if (this.oraMediaEnabledCheckbox) this.oraMediaEnabledCheckbox.checked = oraMediaEnabled;
        if (this.laudesTimeInput) this.laudesTimeInput.value = laudesTime;
        if (this.vespersTimeInput) this.vespersTimeInput.value = vespersTime;
        if (this.complineTimeInput) this.complineTimeInput.value = complineTime;
        if (this.oraMediaTimeInput) this.oraMediaTimeInput.value = oraMediaTime;
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
    if (this.languageSelect) this.languageSelect.value = 'pt-br';
    if (this.laudesEnabledCheckbox) this.laudesEnabledCheckbox.checked = false;
    if (this.vespersEnabledCheckbox) this.vespersEnabledCheckbox.checked = false;
    if (this.complineEnabledCheckbox) this.complineEnabledCheckbox.checked = false;
    if (this.oraMediaEnabledCheckbox) this.oraMediaEnabledCheckbox.checked = false;
    if (this.laudesTimeInput) this.laudesTimeInput.value = '06:00';
    if (this.vespersTimeInput) this.vespersTimeInput.value = '18:00';
    if (this.complineTimeInput) this.complineTimeInput.value = '21:00';
    if (this.oraMediaTimeInput) this.oraMediaTimeInput.value = '12:30';
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    const settings: UpdateSettingsDTO = {
      interval: parseInt(this.intervalInput?.value || '15', 10),
      duration: parseInt(this.durationInput?.value || '10', 10),
      autostart: this.autostartCheckbox?.checked ?? true,
      language: this.languageSelect?.value || 'pt-br',
      laudesEnabled: this.laudesEnabledCheckbox?.checked ?? false,
      vespersEnabled: this.vespersEnabledCheckbox?.checked ?? false,
      complineEnabled: this.complineEnabledCheckbox?.checked ?? false,
      oraMediaEnabled: this.oraMediaEnabledCheckbox?.checked ?? false,
      laudesTime: this.laudesTimeInput?.value || '06:00',
      vespersTime: this.vespersTimeInput?.value || '18:00',
      complineTime: this.complineTimeInput?.value || '21:00',
      oraMediaTime: this.oraMediaTimeInput?.value || '12:30',
    };

    // Validaté
    if (settings.interval! < 1 || settings.interval! > 60) {
      this.showStatus('O intervalo deve estar entre 1 e 60 minutos', 'error');
      return;
    }

    if (settings.duration! < 5 || settings.duration! > 30) {
      this.showStatus('A duração deve estar entre 5 e 30 segundos', 'error');
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(settings.laudesTime || '') ||
        !timePattern.test(settings.vespersTime || '') ||
        !timePattern.test(settings.complineTime || '') ||
        !timePattern.test(settings.oraMediaTime || '')) {
      this.showStatus('Os horarios devem estar no formato HH:MM', 'error');
      return;
    }

    ipcRenderer.send(IPC_CHANNELS.SAVE_SETTINGS, settings);
  }

  private handleSaveResponse(success: boolean): void {
    if (success) {
      this.showStatus('Configurações salvas com sucesso!', 'success');
      window.setTimeout(() => {
        ipcRenderer.send(IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP);
      }, CLOSE_AFTER_SAVE_DELAY_MS);
    } else {
      this.showStatus('Erro ao salvar configurações', 'error');
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
