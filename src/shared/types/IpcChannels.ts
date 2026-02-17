/**
 * Shared Types: IPC Channels
 * Definição tipada de todos os canais IPC.
 */

import { SettingsDTO, UpdateSettingsDTO } from '../../application/dto/SettingsDTO';
import { QuoteDTO } from '../../application/dto/QuoteDTO';
import { PrayerDTO } from '../../application/dto/PrayerDTO';

// IPC Channel names
export const IPC_CHANNELS = {
  // Settings
  GET_CONFIG: 'get-config',
  SAVE_SETTINGS: 'save-settings',
  SETTINGS_SAVED: 'settings-saved',

  // Popup/Quote
  GET_QUOTE: 'get-quote',
  GET_PRELOADED_QUOTE: 'get-preloaded-quote',

  // Prayer
  GET_PRAYER: 'get-prayer',

  // Window management
  CLOSE_SETTINGS_AND_SHOW_POPUP: 'close-settings-and-show-popup',
  OPEN_SETTINGS_FROM_CONTENT: 'open-settings-from-content',

  // System
  GET_USER_DATA_PATH: 'get-user-data-path',
} as const;

// Type-safe IPC request/response types
export interface IpcRequestMap {
  [IPC_CHANNELS.GET_CONFIG]: void;
  [IPC_CHANNELS.SAVE_SETTINGS]: UpdateSettingsDTO;
  [IPC_CHANNELS.GET_QUOTE]: void;
  [IPC_CHANNELS.GET_PRELOADED_QUOTE]: void;
  [IPC_CHANNELS.GET_PRAYER]: { forceEasterTime?: boolean };
  [IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP]: void;
  [IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT]: void;
  [IPC_CHANNELS.GET_USER_DATA_PATH]: void;
}

export interface IpcResponseMap {
  [IPC_CHANNELS.GET_CONFIG]: SettingsDTO;
  [IPC_CHANNELS.SAVE_SETTINGS]: boolean;
  [IPC_CHANNELS.GET_QUOTE]: QuoteDTO;
  [IPC_CHANNELS.GET_PRELOADED_QUOTE]: QuoteDTO | null;
  [IPC_CHANNELS.GET_PRAYER]: PrayerDTO;
  [IPC_CHANNELS.CLOSE_SETTINGS_AND_SHOW_POPUP]: void;
  [IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT]: void;
  [IPC_CHANNELS.GET_USER_DATA_PATH]: string;
}
