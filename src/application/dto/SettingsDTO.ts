/**
 * DTO: SettingsDTO
 * Data Transfer Object para configurações.
 * Usado para comunicação entre camadas.
 */

export interface SettingsDTO {
  interval: number;
  duration: number;
  autostart: boolean;
  easterTime: boolean;
  language: string;
  liturgyReminderSoundEnabled: boolean;
  liturgyReminderSoundVolume: number;
  laudesEnabled: boolean;
  vespersEnabled: boolean;
  complineEnabled: boolean;
  oraMediaEnabled: boolean;
  laudesTime: string;
  vespersTime: string;
  complineTime: string;
  oraMediaTime: string;
}

export interface UpdateSettingsDTO {
  interval?: number;
  duration?: number;
  autostart?: boolean;
  easterTime?: boolean;
  language?: string;
  liturgyReminderSoundEnabled?: boolean;
  liturgyReminderSoundVolume?: number;
  laudesEnabled?: boolean;
  vespersEnabled?: boolean;
  complineEnabled?: boolean;
  oraMediaEnabled?: boolean;
  laudesTime?: string;
  vespersTime?: string;
  complineTime?: string;
  oraMediaTime?: string;
}
