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
  expect(screen.getByText(/Angelus ao meio-dia/i)).toBeInTheDocument();
});

test('integra citações como inspiração contextual sem seção dedicada', () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: '2.0.3',
      assets: {},
    }),
  }));

  render(<App />);

  expect(screen.queryByRole('heading', { name: /Citações de santos/i })).not.toBeInTheDocument();
  expect(screen.getAllByText(/Acostuma-te a elevar o coração a Deus/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Só Deus basta/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Temos esta esperança como âncora da alma/i)).toBeInTheDocument();
  expect(screen.getByText(/Orai sem cessar/i)).toBeInTheDocument();
});
