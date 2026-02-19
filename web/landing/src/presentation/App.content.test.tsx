import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../App';

test('renderiza seção de configurações com itens esperados', () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: '2.0.3',
      assets: {},
    }),
  }));

  render(<App />);

  expect(screen.getByText(/Configurações/i)).toBeInTheDocument();
  expect(screen.getByText(/Intervalo entre popups/i)).toBeInTheDocument();
  expect(screen.getByText(/Liturgia das Horas/i)).toBeInTheDocument();
});
