/**
 * Presentation: Shared Utilities
 * Utilitários compartilhados entre as views.
 */

import path from 'path';

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

  const finishClose = (): void => {
    try {
      window.close();
    } catch (e) {
      console.warn('window.close() failed, trying IPC', e);
      // Fallback if window.close() is blocked or not working
      // Note: You might need to add a specific IPC channel for generic close if 'close-window' isn't handled
      // But usually window.close() works in Electron renderer if nodeIntegration is true or contextIsolation false
      // If not, we can send a message to main process
      // ipcRenderer.send('window-close');
    }
  };

  const body = document.body;

  if (!body) {
    finishClose();
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
    finishClose();
  };

  body.addEventListener('animationend', onAnimationEnd);
  timeoutId = window.setTimeout(() => {
    onAnimationEnd();
  }, CLOSE_FALLBACK_DELAY_MS);
}

export function addFadeInEffect(): void {
  document.body.classList.add('fade-in');
}
