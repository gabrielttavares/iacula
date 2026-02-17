/**
 * Presentation: Shared Utilities
 * Utilitários compartilhados entre as views.
 */

import path from 'path';
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/IpcChannels';

const CLOSE_FALLBACK_DELAY_MS = 800;
let isClosingWindow = false;

export function getAssetPath(relativePath: string): string {
  let fullPath: string;

  if (process.env.NODE_ENV === 'development') {
    fullPath = path.join(process.cwd(), 'assets', relativePath);
  } else {
    fullPath = path.join(process.resourcesPath, 'assets', relativePath);
  }

  return fullPath;
}

export function closeWindow(): void {
  if (isClosingWindow) {
    return;
  }

  isClosingWindow = true;
  fadeOutAndRun(() => {
    try {
      window.close();
    } catch (e) {
      console.warn('window.close() failed, trying IPC', e);
    }
  });
}

export function openSettingsFromContent(): void {
  if (isClosingWindow) {
    return;
  }

  isClosingWindow = true;
  fadeOutAndRun(() => {
    try {
      ipcRenderer.send(IPC_CHANNELS.OPEN_SETTINGS_FROM_CONTENT);
    } catch (e) {
      console.warn('Failed to send open-settings request', e);
    }

    try {
      window.close();
    } catch (e) {
      console.warn('window.close() failed after opening settings', e);
    }
  });
}

function fadeOutAndRun(onDone: () => void): void {
  const finish = (): void => {
    onDone();
  };

  const body = document.body;

  if (!body) {
    finish();
    return;
  }

  body.classList.remove('fade-in');
  body.classList.add('fade-out');

  let didClose = false;
  let timeoutId = 0;

  const onAnimationEnd = (): void => {
    if (didClose) {
      return;
    }

    didClose = true;
    window.clearTimeout(timeoutId);
    body.removeEventListener('animationend', onAnimationEnd);
    finish();
  };

  body.addEventListener('animationend', onAnimationEnd);
  timeoutId = window.setTimeout(() => {
    onAnimationEnd();
  }, CLOSE_FALLBACK_DELAY_MS);
}

export function addFadeInEffect(): void {
  document.body.classList.add('fade-in');
}
