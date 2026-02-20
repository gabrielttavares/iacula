import { EventEmitter } from 'events';

jest.mock('electron', () => {
  const notificationShow = jest.fn();
  const Notification = jest.fn().mockImplementation(() => ({
    show: notificationShow,
  }));
  (Notification as unknown as { isSupported: jest.Mock }).isSupported = jest.fn(() => true);

  return {
    dialog: {
      showMessageBox: jest.fn(),
    },
    Notification,
  };
});

jest.mock('electron-updater', () => {
  const updater = new EventEmitter() as EventEmitter & {
    checkForUpdates: jest.Mock;
    downloadUpdate: jest.Mock;
    quitAndInstall: jest.Mock;
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
  };

  updater.checkForUpdates = jest.fn();
  updater.downloadUpdate = jest.fn();
  updater.quitAndInstall = jest.fn();
  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = true;

  return { autoUpdater: updater };
}, { virtual: true });

import { dialog, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import { UpdateManager } from '../../../src/main/bootstrap/UpdateManager';

const sixHoursMs = 6 * 60 * 60 * 1000;

function flushMicrotasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

describe('UpdateManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (autoUpdater as unknown as EventEmitter).removeAllListeners();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should check for updates on startup in packaged mode', () => {
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();

    expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1);
  });

  it('should not check for updates in development mode', () => {
    const manager = new UpdateManager({ isPackaged: false, checkIntervalMs: sixHoursMs });
    manager.start();

    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('should schedule periodic checks every 6 hours', () => {
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();
    expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(sixHoursMs);
    expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(2);
  });

  it('should show pt-BR prompt on update available and download after consent', async () => {
    (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();

    (autoUpdater as unknown as EventEmitter).emit('update-available', { version: '1.2.0' });
    await flushMicrotasks();

    expect(dialog.showMessageBox).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Atualização disponível',
      message: 'A versão v1.2.0 do Iacula está disponível. Deseja baixar agora?',
      buttons: ['Baixar agora', 'Depois'],
    }));
    expect(autoUpdater.downloadUpdate).toHaveBeenCalledTimes(1);
  });

  it('should not download update when user chooses later', async () => {
    (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 });
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();

    (autoUpdater as unknown as EventEmitter).emit('update-available', { version: '1.2.0' });
    await flushMicrotasks();

    expect(autoUpdater.downloadUpdate).not.toHaveBeenCalled();
  });

  it('should prompt install in pt-BR and install immediately on consent', async () => {
    (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();

    (autoUpdater as unknown as EventEmitter).emit('update-downloaded', { version: '1.2.0' });
    await flushMicrotasks();

    expect(dialog.showMessageBox).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Atualização pronta para instalar',
      message: 'A versão v1.2.0 foi baixada com sucesso. Deseja instalar agora?',
      buttons: ['Instalar agora', 'Depois'],
    }));
    expect(autoUpdater.quitAndInstall).toHaveBeenCalledTimes(1);
  });

  it('should not install immediately when user chooses later', async () => {
    (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 });
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();

    (autoUpdater as unknown as EventEmitter).emit('update-downloaded', { version: '1.2.0' });
    await flushMicrotasks();

    expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled();
  });

  it('should show pt-BR error notification when updater errors', async () => {
    const manager = new UpdateManager({ isPackaged: true, checkIntervalMs: sixHoursMs });
    manager.start();

    (autoUpdater as unknown as EventEmitter).emit('error', new Error('network'));
    await flushMicrotasks();

    expect(Notification).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Falha na atualização',
      body: 'Não foi possível verificar ou baixar a atualização agora.',
    }));
  });
});
