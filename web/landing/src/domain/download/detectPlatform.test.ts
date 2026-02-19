import { expect, test } from 'vitest';
import { detectPlatform } from './detectPlatform';

test('detecta windows por userAgent', () => {
  expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows');
});

test('detecta macos por userAgent', () => {
  expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macos');
});

test('detecta linux por userAgent', () => {
  expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe('linux');
});

test('retorna unknown quando não reconhece plataforma', () => {
  expect(detectPlatform('Custom Agent')).toBe('unknown');
});
