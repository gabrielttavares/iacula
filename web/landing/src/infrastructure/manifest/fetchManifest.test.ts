import { expect, test, vi } from 'vitest';
import { fetchManifest } from './fetchManifest';

test('lança erro quando manifesto não contém version', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ assets: {} }),
  }));

  await expect(fetchManifest('/manifest.json')).rejects.toThrow('Manifesto inválido');
});

test('retorna manifesto válido quando contrato mínimo existe', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: '2.0.3',
      assets: { windows: 'https://example.com/iacula.exe' },
    }),
  }));

  await expect(fetchManifest('/manifest.json')).resolves.toEqual({
    version: '2.0.3',
    assets: { windows: 'https://example.com/iacula.exe' },
  });
});
