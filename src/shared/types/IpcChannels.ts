/**
 * Shared Types: IPC Channels
 * Definição tipada de todos os canais IPC.
 */

import { SettingsDTO, UpdateSettingsDTO } from '../../application/dto/SettingsDTO';
import { QuoteDTO } from '../../application/dto/QuoteDTO';
import { PrayerDTO } from '../../application/dto/PrayerDTO';
import { LiturgyHourModule, LiturgyReminderDTO } from '../../application/dto/LiturgyHoursDTO';

// IPC Channel names
export const IPC_CHANNELS = {
  // Settings
  GET_CONFIG: 'get-config',
  SAVE_SETTINGS: 'save-settings',
  SETTINGS_SAVED: 'settings-saved',

  // Popup/Quote
  GET_QUOTE: 'get-quote',
  GET_PRELOADED_QUOTE: 'get-preloaded-quote',
  GET_PRELOADED_LITURGY_REMINDER: 'get-preloaded-liturgy-reminder',

  // Prayer
  GET_PRAYER: 'get-prayer',

  // Window management
  CLOSE_SETTINGS_AND_SHOW_POPUP: 'close-settings-and-show-popup',
  OPEN_SETTINGS_FROM_CONTENT: 'open-settings-from-content',
  OPEN_LITURGY_OFFICE: 'open-liturgy-office',

  // System
  GET_USER_DATA_PATH: 'get-user-data-path',
  GET_APP_VERSION: 'get-app-version',
} as const;

// Type-safe IPC request/response types
export interface IpcRequestMap {
  [IPC_CHANNELS.GET_CONFIG]: void;
  [IPC_CHANNELS.SAVE_SETTINGS]: UpdateSettingsDTO;
  [IPC_CHANNELS.GET_QUOTE]: void;
  [IPC_CHANNELS.GET_PRELOADED_QUOTE]: void;
  [IPC_CHANNELS.GET_PRELOADED_LITURGY_REMINDER]: void;
  [IPC_CHANNELS.GET_PRAYER]: { forceEasterTime?: boolean };
  [IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP]: void;
  [IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT]: void;
  [IPC_CHANNELS.OPEN_LITURGY_OFFICE]: { module: LiturgyHourModule };
  [IPC_CHANNELS.GET_USER_DATA_PATH]: void;
  [IPC_CHANNELS.GET_APP_VERSION]: void;
}

export interface IpcResponseMap {
  [IPC_CHANNELS.GET_CONFIG]: SettingsDTO;
  [IPC_CHANNELS.SAVE_SETTINGS]: boolean;
  [IPC_CHANNELS.GET_QUOTE]: QuoteDTO;
  [IPC_CHANNELS.GET_PRELOADED_QUOTE]: QuoteDTO | null;
  [IPC_CHANNELS.GET_PRELOADED_LITURGY_REMINDER]: LiturgyReminderDTO | null;
  [IPC_CHANNELS.GET_PRAYER]: PrayerDTO;
  [IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP]: void;
  [IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT]: void;
  [IPC_CHANNELS.OPEN_LITURGY_OFFICE]: void;
  [IPC_CHANNELS.GET_USER_DATA_PATH]: string;
  [IPC_CHANNELS.GET_APP_VERSION]: string;
}
