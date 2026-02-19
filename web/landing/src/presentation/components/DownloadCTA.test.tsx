import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { DownloadCTA } from './DownloadCTA';

test('exibe label "Baixar para Windows" para plataforma windows', () => {
  render(<DownloadCTA cta={{ kind: 'download', label: 'Baixar para Windows', href: 'https://example.com/file.exe' }} />);

  expect(screen.getByRole('link', { name: 'Baixar para Windows' })).toBeInTheDocument();
});

test('renderiza fallback "Ver downloads" quando kind é fallback', () => {
  render(<DownloadCTA cta={{ kind: 'fallback', label: 'Ver downloads', href: 'https://github.com/gabrielttavares/iacula/releases' }} />);

  expect(screen.getByRole('link', { name: 'Ver downloads' })).toBeInTheDocument();
});
