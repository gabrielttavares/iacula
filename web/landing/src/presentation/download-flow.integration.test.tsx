import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from '../App';

function setUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('resolve CTA para Windows quando manifesto possui asset windows', async () => {
  setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: '2.0.3',
      assets: {
        windows: 'https://example.com/Iacula-Setup-2.0.3.exe',
      },
      fallbackUrl: 'https://example.com/releases',
    }),
  }));

  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('link', { name: 'Baixar para Windows' })).toBeInTheDocument();
  });

  const link = screen.getByRole('link', { name: 'Baixar para Windows' }) as HTMLAnchorElement;
  expect(link.href).toBe('https://example.com/Iacula-Setup-2.0.3.exe');
});

test('usa fallbackUrl do manifesto quando plataforma não possui asset', async () => {
  setUserAgent('Custom Agent');

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: '2.0.3',
      assets: {},
      fallbackUrl: 'https://example.com/fallback',
    }),
  }));

  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('link', { name: 'Ver downloads' })).toBeInTheDocument();
  });

  const fallbackLink = screen.getByRole('link', { name: 'Ver downloads' }) as HTMLAnchorElement;
  expect(fallbackLink.href).toBe('https://example.com/fallback');
});
