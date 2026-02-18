jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    requestSingleInstanceLock: jest.fn(),
    setActivationPolicy: jest.fn(),
    dock: {
      hide: jest.fn(),
    },
  },
  shell: {
    openExternal: jest.fn(),
  },
}));

jest.mock('@electron/remote/main', () => ({
  initialize: jest.fn(),
  enable: jest.fn(),
}));

import { IaculaApp, bootstrapSingleInstance } from '../../src/main/main';

describe('main single-instance bootstrap', () => {
  it('quits when single-instance lock is not acquired', () => {
    const quit = jest.fn();
    const on = jest.fn();
    const requestSingleInstanceLock = jest.fn(() => false);
    const createApp = jest.fn();

    const result = bootstrapSingleInstance(
      { requestSingleInstanceLock, quit, on } as never,
      createApp,
    );

    expect(result).toBeNull();
    expect(quit).toHaveBeenCalledTimes(1);
    expect(createApp).not.toHaveBeenCalled();
  });

  it('handles second-instance by forwarding to app relaunch handler', async () => {
    const listeners: Record<string, () => void> = {};
    const on = jest.fn((event: string, callback: () => void) => {
      listeners[event] = callback;
    });
    const requestSingleInstanceLock = jest.fn(() => true);
    const quit = jest.fn();
    const handleRelaunchRequest = jest.fn(async () => undefined);
    const appInstance = { handleRelaunchRequest } as unknown as IaculaApp;

    const result = bootstrapSingleInstance(
      { requestSingleInstanceLock, quit, on } as never,
      () => appInstance,
    );

    expect(result).toBe(appInstance);
    expect(on).toHaveBeenCalledWith('second-instance', expect.any(Function));

    listeners['second-instance']();
    expect(handleRelaunchRequest).toHaveBeenCalledWith('second-instance');
  });

  it('handles activate by forwarding to app relaunch handler', async () => {
    const listeners: Record<string, () => void> = {};
    const on = jest.fn((event: string, callback: () => void) => {
      listeners[event] = callback;
    });
    const requestSingleInstanceLock = jest.fn(() => true);
    const quit = jest.fn();
    const handleRelaunchRequest = jest.fn(async () => undefined);
    const appInstance = { handleRelaunchRequest } as unknown as IaculaApp;

    bootstrapSingleInstance(
      { requestSingleInstanceLock, quit, on } as never,
      () => appInstance,
    );

    expect(on).toHaveBeenCalledWith('activate', expect.any(Function));

    listeners['activate']();
    expect(handleRelaunchRequest).toHaveBeenCalledWith('activate');
  });
});

describe('IaculaApp relaunch behavior', () => {
  it('closes transient cards and opens settings on relaunch', async () => {
    const close = jest.fn(async () => undefined);
    const show = jest.fn(async () => undefined);

    const containerMock = {
      windowService: { close, show },
    };

    const app = new IaculaApp(containerMock as never, false);
    await app.handleRelaunchRequest();

    expect(close).toHaveBeenCalledWith('popup');
    expect(close).toHaveBeenCalledWith('angelus');
    expect(close).toHaveBeenCalledWith('reginaCaeli');
    expect(close).toHaveBeenCalledWith('liturgyReminder');
    expect(show).toHaveBeenCalledWith('settings');
  });

  it('ignores activate relaunch during startup stabilization window', async () => {
    const close = jest.fn(async () => undefined);
    const show = jest.fn(async () => undefined);
    const containerMock = {
      windowService: { close, show },
    };

    const app = new IaculaApp(containerMock as never, false);
    await app.handleRelaunchRequest('activate');

    expect(close).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('handles activate relaunch after startup stabilization window', async () => {
    const close = jest.fn(async () => undefined);
    const show = jest.fn(async () => undefined);
    const containerMock = {
      windowService: { close, show },
    };

    const app = new IaculaApp(containerMock as never, false);
    (app as unknown as { initializedAtMs: number }).initializedAtMs = Date.now() - 3000;

    await app.handleRelaunchRequest('activate');

    expect(close).toHaveBeenCalledWith('popup');
    expect(close).toHaveBeenCalledWith('angelus');
    expect(close).toHaveBeenCalledWith('reginaCaeli');
    expect(close).toHaveBeenCalledWith('liturgyReminder');
    expect(show).toHaveBeenCalledWith('settings');
  });
});
