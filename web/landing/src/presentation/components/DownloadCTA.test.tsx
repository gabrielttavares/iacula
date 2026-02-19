import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { DownloadCTA } from './DownloadCTA';

afterEach(() => {
  cleanup();
});

test('exibe label "Baixar para Windows" para plataforma windows', () => {
  render(<DownloadCTA cta={{ kind: 'download', label: 'Baixar para Windows', href: 'https://example.com/file.exe' }} />);

  expect(screen.getByRole('link', { name: 'Baixar para Windows' })).toBeInTheDocument();
});

test('renderiza fallback "Ver downloads" quando kind é fallback', () => {
  render(<DownloadCTA cta={{ kind: 'fallback', label: 'Ver downloads', href: 'https://github.com/gabrielttavares/iacula/releases' }} />);

  expect(screen.getByRole('link', { name: 'Ver downloads' })).toBeInTheDocument();
});

test('aplica borda arredondada no botão', () => {
  render(<DownloadCTA cta={{ kind: 'download', label: 'Baixar para Windows', href: 'https://example.com/file.exe' }} />);

  const [ctaLink] = screen.getAllByRole('link', { name: 'Baixar para Windows' });
  expect(ctaLink.className).toContain('rounded-xl');
});

test('mostra ícone de plataforma quando o CTA é de download', () => {
  render(<DownloadCTA cta={{ kind: 'download', label: 'Baixar para macOS', href: 'https://example.com/file.dmg' }} />);

  expect(screen.getByTestId('platform-icon-macos')).toBeInTheDocument();
});
