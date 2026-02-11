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
}

export interface UpdateSettingsDTO {
  interval?: number;
  duration?: number;
  autostart?: boolean;
  easterTime?: boolean;
  language?: string;
}
