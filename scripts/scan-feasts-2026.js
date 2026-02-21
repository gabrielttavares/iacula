#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://liturgia.up.railway.app/v2';
const YEAR = Number(process.argv[2] || '2026');
const DELAY_MS = Number(process.argv[3] || '120');
const ROOT = process.cwd();
const IMAGES_FEASTS_DIR = path.join(ROOT, 'assets', 'images', 'feasts');
const OUTPUT = path.join(ROOT, 'docs', 'feasts-manifest-' + YEAR + '.json');

function normalize(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return normalize(value)
    .replace(/,\s*(solenidade|festa|memoria)$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseRank(liturgia) {
  const normalized = normalize(liturgia);
  if (normalized.includes('solenidade')) return 'solemnity';
  if (normalized.includes('festa')) return 'feast';
  if (normalized.includes('memoria')) return 'memorial';
  return 'weekday';
}

function stripRank(liturgia) {
  return (liturgia || '').replace(/,\s*(Solenidade|Festa|Memoria|Memória)$/i, '').trim();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

(async () => {
  const manifest = [];
  const start = new Date(Date.UTC(YEAR, 0, 1));
  const end = new Date(Date.UTC(YEAR, 11, 31));

  fs.mkdirSync(IMAGES_FEASTS_DIR, { recursive: true });

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = String(cursor.getUTCDate()).padStart(2, '0');
    const month = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    const year = String(cursor.getUTCFullYear());
    const url = `${BASE_URL}/?dia=${day}&mes=${month}&ano=${year}`;

    try {
      const payload = await fetchJson(url);
      const liturgia = payload.liturgia || '';
      const rank = parseRank(liturgia);

      if (rank === 'solemnity' || rank === 'feast') {
        const feastName = stripRank(liturgia);
        const slug = slugify(feastName);

        manifest.push({
          date: `${year}-${month}-${day}`,
          slug,
          liturgia,
          feastName,
          rank,
          cor: payload.cor || null,
        });

        fs.mkdirSync(path.join(IMAGES_FEASTS_DIR, slug), { recursive: true });
      }
    } catch (error) {
      console.warn(`[scan-feasts] Failed ${year}-${month}-${day}: ${String(error)}`);
    }

    await delay(DELAY_MS);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
  console.log(`[scan-feasts] Manifest created: ${OUTPUT}`);
  console.log(`[scan-feasts] Detected ${manifest.length} feast days.`);
})();
