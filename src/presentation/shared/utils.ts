/**
 * Presentation: Shared Utilities
 * Utilitários compartilhados entre as views.
 */

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
  window.close();
}

export function addFadeInEffect(): void {
  document.body.classList.add('fade-in');
}
