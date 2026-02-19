import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../App';

test('CTA principal é visível e acessível', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: '2.0.3',
      assets: {},
    }),
  }));

  render(<App />);
  const ctaLink = screen.getByRole('link', { name: /Baixar|Ver downloads/i });
  expect(ctaLink).toBeVisible();
  expect(ctaLink).toHaveAttribute('href');
});
