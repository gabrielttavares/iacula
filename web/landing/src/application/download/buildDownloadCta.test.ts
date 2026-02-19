import { expect, test } from 'vitest';
import { buildDownloadCta } from './buildDownloadCta';
import { DownloadManifest } from '../../domain/download/types';

test('usa fallback quando asset da plataforma não existe', () => {
  const manifest: DownloadManifest = {
    version: '2.0.0',
    assets: {},
  };

  const cta = buildDownloadCta(manifest, 'macos', 'https://github.com/gabrielttavares/iacula/releases');
  expect(cta).toEqual({
    kind: 'fallback',
    label: 'Ver downloads',
    href: 'https://github.com/gabrielttavares/iacula/releases',
  });
});

test('retorna CTA de download por plataforma quando asset existe', () => {
  const manifest: DownloadManifest = {
    version: '2.0.0',
    assets: {
      windows: 'https://example.com/iacula-setup.exe',
    },
  };

  const cta = buildDownloadCta(manifest, 'windows', 'https://github.com/gabrielttavares/iacula/releases');
  expect(cta).toEqual({
    kind: 'download',
    label: 'Baixar para Windows',
    href: 'https://example.com/iacula-setup.exe',
  });
});
