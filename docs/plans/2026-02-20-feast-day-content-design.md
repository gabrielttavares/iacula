# Feast Day Content Design

## Overview

Extend Iacula to detect liturgical feast days (solemnities, feasts) from the Liturgia API and display feast-specific quotes and images. The API already returns rich liturgical data for every day — this feature leverages it alongside hand-curated content to make ~30-40 days per year feel liturgically distinct.

## Context

Currently the app recognizes 5 broad liturgical seasons (`ordinary`, `advent`, `lent`, `easter`, `christmas`) via the `RemoteLiturgicalSeasonService`, which maps the API's `cor` (color) and `liturgia` (description) fields to a `LiturgicalSeason` string. This works for seasonal content but misses feast days entirely — Holy Thursday maps to `ordinary`, Pentecost maps to `ordinary`, etc.

The Liturgia API (`https://liturgia.up.railway.app/v2`) returns the feast name, rank, liturgical color, readings, antiphons, psalm refrains, and prayers for every day. This is more than enough to detect feast days and extract short, prayer-like texts suitable for the popup.

## Architecture: Richer Liturgical Context

Evolve `ILiturgicalSeasonService` to return a `LiturgicalContext` object alongside the existing `LiturgicalSeason`.

### New types

```typescript
type LiturgicalRank = 'solemnity' | 'feast' | 'memorial' | 'weekday';

interface LiturgicalContext {
  season: LiturgicalSeason;       // always present, backward compatible
  feast?: string;                  // slug: 'pentecost', 'holy-thursday', etc.
  feastName?: string;              // display: 'Pentecostes', 'Quinta-feira Santa'
  rank: LiturgicalRank;           // parsed from API liturgia field
  apiQuotes: string[];            // extracted antiphons, psalm refrain, prayers
}
```

### Updated interface

```typescript
interface ILiturgicalSeasonService {
  getCurrentSeason(date?: Date): Promise<LiturgicalSeason>;      // kept for backward compat
  getCurrentContext(date?: Date): Promise<LiturgicalContext>;     // new
}
```

## Feast Detection

Keyword pattern matching on the normalized `liturgia` string from the API. The `FEAST_PATTERNS` table is generated from a full-year API scan (see "Full Year API Scan" section below).

```typescript
private static readonly FEAST_PATTERNS: Array<{ keywords: string[]; slug: string }> = [
  { keywords: ['domingo de ramos'],                slug: 'palm-sunday' },
  { keywords: ['semana santa', 'ceia do senhor'],  slug: 'holy-thursday' },
  { keywords: ['paixão do senhor'],                slug: 'good-friday' },
  { keywords: ['vigília pascal'],                  slug: 'easter-vigil' },
  { keywords: ['domingo de páscoa'],               slug: 'easter-sunday' },
  { keywords: ['pentecostes'],                     slug: 'pentecost' },
  { keywords: ['santíssima trindade'],             slug: 'holy-trinity' },
  { keywords: ['corpo e sangue de cristo'],        slug: 'corpus-christi' },
  { keywords: ['todos os santos'],                 slug: 'all-saints' },
  { keywords: ['imaculada conceição'],             slug: 'immaculate-conception' },
  { keywords: ['assunção'],                        slug: 'assumption' },
  { keywords: ['são josé'],                        slug: 'st-joseph' },
  { keywords: ['santos pedro e paulo'],            slug: 'sts-peter-paul' },
  { keywords: ['aparecida'],                       slug: 'our-lady-aparecida' },
  // ... additional feasts discovered by full-year scan
];
```

Rank is parsed from the `liturgia` field by checking for `, Solenidade` / `, Festa` / `, Memória` suffixes.

The `feastName` is derived by stripping the rank suffix and normalizing Holy Week descriptions (e.g. `"5ª feira da Semana Santa - Missa Vespertina..."` -> `"quinta-feira santa"`).

## Expanded API Response Interface

```typescript
interface LiturgiaDiariaResponse {
  cor?: string;
  liturgia?: string;
  antifonas?: { entrada?: string; comunhao?: string };
  leituras?: { salmo?: Array<{ refrao?: string }> };
  oracoes?: { coleta?: string; oferendas?: string; comunhao?: string };
}
```

`apiQuotes` is built by collecting all non-empty values from: `antifonas.entrada`, `antifonas.comunhao`, `leituras.salmo[0].refrao`, `oracoes.coleta`, `oracoes.oferendas`, `oracoes.comunhao`.

## Holy Week Season Fix

The `mapSeason()` method is also fixed: keywords `semana santa`, `paixão`, `paixao` in the `liturgia` field map the season to `lent` (currently they incorrectly fall through to `ordinary`).

## Asset Structure

### Feast quote files

```
assets/quotes/pt-br/feasts/
├── palm-sunday.json
├── holy-thursday.json
├── good-friday.json
├── easter-vigil.json
├── easter-sunday.json
├── pentecost.json
├── holy-trinity.json
├── corpus-christi.json
├── all-saints.json
├── immaculate-conception.json
├── assumption.json
├── st-joseph.json
├── sts-peter-paul.json
├── our-lady-aparecida.json
└── ...
```

Format (simpler than seasonal files — no day-of-week keys):

```json
{
  "theme": "O Mistério de Pentecostes",
  "quotes": [
    "Veni, Sancte Spiritus...",
    "..."
  ]
}
```

### Feast image directories

```
assets/images/feasts/
├── palm-sunday/
├── holy-thursday/
├── good-friday/
├── pentecost/
└── ...
```

Same flat-directory pattern as the existing seasonal images. Each starts empty; images are dropped in as curated. Directories are auto-created by the full-year scan script.

## Quote Resolution Priority

On a feast day, quotes are resolved in this order:

| Feast file exists? | API available? | Result |
|---|---|---|
| Yes | Yes | Merged pool: hand-curated + API quotes |
| Yes | No | Hand-curated quotes only |
| No | Yes | API quotes only |
| No | No | Fall back to current season quotes |

Deduplication removes near-identical entries between the two sources. Cycling uses the same circular index logic as today.

## Image Resolution Priority

1. `images/feasts/{slug}/` — feast-specific images (cycle)
2. `images/{season}/` — current seasonal images
3. `images/ordinary/{dayOfWeek}/` — ordinary day-of-week images

## Updated QuoteDTO

```typescript
interface QuoteDTO {
  text: string;
  imagePath: string | null;
  dayOfWeek: number;
  theme: string;
  season: LiturgicalSeason;
  feast?: string;          // NEW: slug
  feastName?: string;      // NEW: display name
}
```

## New IAssetService Methods

```typescript
loadFeastQuotes(slug: string): Promise<string[] | null>;
getFeastImagePath(slug: string): Promise<string | null>;
```

## UI Changes

Minimal. The popup card (190x190px) stays identical. On feast days:

- **Quote text**: feast-specific instead of seasonal
- **Background image**: from `images/feasts/{slug}/` if available
- **Label**: feast name instead of season name (same subtle style — lowercase, 0.48rem, 28% opacity)

```typescript
// popup.controller.ts
if (quote.feastName) {
  seasonLabel.textContent = quote.feastName;
} else {
  seasonLabel.textContent = seasonMap[quote.season] ?? '';
}
```

No changes to Angelus/Regina Caeli logic — it continues reading `context.season` which is unaffected.

## Full Year API Scan & Directory Scaffolding

### Scan script

A one-time Node/TypeScript script that:

1. Queries the Liturgia API for every day of 2026 (365 requests)
2. Parses each response's `liturgia` field for rank indicators (`Solenidade`, `Festa`)
3. Extracts the feast name and derives a slug
4. Outputs a JSON manifest of all detected feasts with dates, slugs, and display names
5. Auto-creates `assets/images/feasts/{slug}/` directories for every discovered feast

Rate limiting: ~100-200ms delay between requests (~1-2 minutes total).

### Manifest output

```json
[
  {
    "date": "2026-01-01",
    "slug": "mary-mother-of-god",
    "liturgia": "Santa Maria, Mãe de Deus, Solenidade",
    "feastName": "Santa Maria, Mãe de Deus",
    "rank": "solemnity",
    "cor": "Branco"
  },
  ...
]
```

This manifest serves as the source of truth for the `FEAST_PATTERNS` table and as documentation of all feasts the app recognizes.

### Re-running the scan

Liturgical dates shift year to year (Easter is a moveable feast). The scan is repeatable for new years. However, the `FEAST_PATTERNS` table uses keyword patterns (not fixed dates), so it works across years without re-running. The scan is primarily for initial discovery, directory creation, and pattern validation.

## Error Handling

- **API failure**: returns `{ season: 'ordinary', rank: 'weekday', apiQuotes: [] }` — no feast, no API quotes. Same degradation as today.
- **Feast file missing**: only API quotes used. Every feast gets relevant content from day one.
- **API quotes empty**: falls back to current season quotes. User never sees a blank popup.
- **Unrecognized feast**: no feast detected, treated as regular seasonal day.
- **Holy Week fix**: `semana santa` / `paixão` keywords in `liturgia` now map season to `lent`.

## Testing

- **Feast detection**: each `FEAST_PATTERNS` entry tested against real API `liturgia` strings
- **Rank parsing**: `Solenidade` -> `solemnity`, `Festa` -> `feast`, no suffix -> `weekday`
- **API quote extraction**: each field extracted correctly, missing fields skipped
- **Quote merging**: hand-curated + API merge, deduplication, fallback chain
- **Asset resolution**: feast files load/return null, feast images load/return null
- **Integration**: extend existing integration test for known feast dates
- **Holy Week fix**: Holy Thursday/Good Friday now map to `lent` instead of `ordinary`
