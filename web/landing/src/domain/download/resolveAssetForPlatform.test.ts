import { expect, test } from 'vitest';
import { resolveAssetForPlatform } from './resolveAssetForPlatform';
import { DownloadManifest } from './types';

test('retorna asset windows quando disponível', () => {
  const manifest: DownloadManifest = {
    version: '2.0.0',
    assets: {
      windows: 'https://example.com/Iacula-Setup-2.0.0.exe',
    },
  };

  const result = resolveAssetForPlatform(manifest, 'windows');
  expect(result).toEqual({
    platform: 'windows',
    url: 'https://example.com/Iacula-Setup-2.0.0.exe',
  });
});

test('retorna null quando plataforma não possui asset no manifesto', () => {
  const manifest: DownloadManifest = {
    version: '2.0.0',
    assets: {},
  };

  const result = resolveAssetForPlatform(manifest, 'linux');
  expect(result).toBeNull();
});
