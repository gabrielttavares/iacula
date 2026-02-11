/**
 * Presentation: Shared Utilities
 * Utilitários compartilhados entre as views.
 */

import { ipcRenderer } from 'electron';
import path from 'path';

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
}

export function addFadeInEffect(): void {
  document.body.classList.add('fade-in');
}
