declare module 'electron-updater' {
  import { EventEmitter } from 'events';

  interface AutoUpdaterLike extends EventEmitter {
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
    checkForUpdates: () => Promise<unknown> | unknown;
    downloadUpdate: () => Promise<unknown> | unknown;
    quitAndInstall: () => void;
  }

  export const autoUpdater: AutoUpdaterLike;
}
