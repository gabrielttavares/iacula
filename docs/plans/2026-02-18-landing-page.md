# Landing Page Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar um módulo `web/landing` (Vite + React + TypeScript) em pt-BR com CTA único de download por SO, resolvido por `manifest.json`, com fallback para GitHub Releases.

**Architecture:** O módulo será isolado em `web/landing` e seguirá separação clean-ish (`domain`, `application`, `infrastructure`, `presentation`). Regras de plataforma/asset ficam em funções puras testadas primeiro (TDD). O frontend consome um manifesto estático gerado pelo pipeline para resolver o botão de download.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, CSS modules (ou CSS simples por componente), Node script para manifesto no CI.

---

### Task 1: Scaffold do módulo web/landing

**Files:**
- Create: `web/landing/package.json`
- Create: `web/landing/tsconfig.json`
- Create: `web/landing/vite.config.ts`
- Create: `web/landing/index.html`
- Create: `web/landing/src/main.tsx`
- Create: `web/landing/src/App.tsx`

**Step 1: Write the failing test**

```ts
// web/landing/src/App.smoke.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza título principal da landing', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- App.smoke.test.tsx`
Expected: FAIL por estrutura ainda inexistente.

**Step 3: Write minimal implementation**

```tsx
export default function App() {
  return <h1>Iacula</h1>;
}
```

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- App.smoke.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing
git commit -m "feat(landing): scaffold Vite React module"
```

### Task 2: Domain rule - detecção de plataforma

**Files:**
- Create: `web/landing/src/domain/download/detectPlatform.ts`
- Test: `web/landing/src/domain/download/detectPlatform.test.ts`

**Step 1: Write the failing test**

```ts
import { detectPlatform } from './detectPlatform';

test('detecta windows por userAgent', () => {
  expect(detectPlatform('Mozilla ... Windows NT 10.0 ...')).toBe('windows');
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- detectPlatform.test.ts`
Expected: FAIL (função inexistente).

**Step 3: Write minimal implementation**

```ts
export type Platform = 'windows' | 'linux' | 'macos' | 'unknown';
export function detectPlatform(ua: string): Platform {
  const s = ua.toLowerCase();
  if (s.includes('windows')) return 'windows';
  if (s.includes('mac os') || s.includes('macintosh')) return 'macos';
  if (s.includes('linux')) return 'linux';
  return 'unknown';
}
```

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- detectPlatform.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/domain/download/detectPlatform.*
git commit -m "feat(landing): add platform detection rule"
```

### Task 3: Domain rule - resolver asset por plataforma

**Files:**
- Create: `web/landing/src/domain/download/resolveAssetForPlatform.ts`
- Create: `web/landing/src/domain/download/types.ts`
- Test: `web/landing/src/domain/download/resolveAssetForPlatform.test.ts`

**Step 1: Write the failing test**

```ts
import { resolveAssetForPlatform } from './resolveAssetForPlatform';

test('retorna asset windows quando disponível', () => {
  const manifest = { version: '2.0.0', assets: { windows: 'https://x/Iacula-Setup.exe' } };
  expect(resolveAssetForPlatform(manifest, 'windows')?.url).toContain('.exe');
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- resolveAssetForPlatform.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export function resolveAssetForPlatform(manifest: DownloadManifest, platform: Platform) {
  const url = manifest.assets[platform];
  if (!url) return null;
  return { platform, url };
}
```

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- resolveAssetForPlatform.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/domain/download
git commit -m "feat(landing): resolve release asset by platform"
```

### Task 4: Application use case - montar CTA final com fallback

**Files:**
- Create: `web/landing/src/application/download/buildDownloadCta.ts`
- Test: `web/landing/src/application/download/buildDownloadCta.test.ts`

**Step 1: Write the failing test**

```ts
import { buildDownloadCta } from './buildDownloadCta';

test('usa fallback quando asset da plataforma não existe', () => {
  const cta = buildDownloadCta({ version: '2.0.0', assets: {} }, 'macos', 'https://github.com/.../releases');
  expect(cta.kind).toBe('fallback');
  expect(cta.label).toBe('Ver downloads');
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- buildDownloadCta.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export function buildDownloadCta(manifest: DownloadManifest, platform: Platform, fallbackUrl: string) {
  const asset = resolveAssetForPlatform(manifest, platform);
  if (!asset) return { kind: 'fallback', label: 'Ver downloads', href: fallbackUrl };
  const label = platform === 'windows' ? 'Baixar para Windows'
    : platform === 'linux' ? 'Baixar para Linux'
    : 'Baixar para macOS';
  return { kind: 'download', label, href: asset.url };
}
```

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- buildDownloadCta.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/application/download
git commit -m "feat(landing): add CTA use case with release fallback"
```

### Task 5: Infrastructure - fetch e validação do manifesto

**Files:**
- Create: `web/landing/src/infrastructure/manifest/fetchManifest.ts`
- Test: `web/landing/src/infrastructure/manifest/fetchManifest.test.ts`

**Step 1: Write the failing test**

```ts
import { fetchManifest } from './fetchManifest';

test('lança erro quando manifesto não contém version', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ assets: {} }) }) as any;
  await expect(fetchManifest('/manifest.json')).rejects.toThrow('Manifesto inválido');
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- fetchManifest.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export async function fetchManifest(url: string): Promise<DownloadManifest> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao carregar manifesto');
  const data = await response.json();
  if (!data?.version || !data?.assets) throw new Error('Manifesto inválido');
  return data as DownloadManifest;
}
```

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- fetchManifest.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/infrastructure/manifest
git commit -m "feat(landing): add manifest fetch with schema guard"
```

### Task 6: Presentation - componentes e CTA dinâmico

**Files:**
- Create: `web/landing/src/presentation/components/Hero.tsx`
- Create: `web/landing/src/presentation/components/DownloadCTA.tsx`
- Create: `web/landing/src/presentation/components/SettingsOverview.tsx`
- Create: `web/landing/src/presentation/components/SaintQuotes.tsx`
- Modify: `web/landing/src/App.tsx`
- Test: `web/landing/src/presentation/components/DownloadCTA.test.tsx`

**Step 1: Write the failing test**

```tsx
test('exibe label "Baixar para Windows" para plataforma windows', () => {
  render(<DownloadCTA cta={{ kind: 'download', label: 'Baixar para Windows', href: 'https://x' }} />);
  expect(screen.getByRole('link', { name: 'Baixar para Windows' })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- DownloadCTA.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
export function DownloadCTA({ cta }: { cta: { label: string; href: string } }) {
  return <a href={cta.href}>{cta.label}</a>;
}
```

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- DownloadCTA.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/presentation web/landing/src/App.tsx
git commit -m "feat(landing): implement dynamic download CTA and content sections"
```

### Task 7: Conteúdo pt-BR e seções completas da LP

**Files:**
- Modify: `web/landing/src/presentation/components/Hero.tsx`
- Modify: `web/landing/src/presentation/components/SaintQuotes.tsx`
- Modify: `web/landing/src/presentation/components/SettingsOverview.tsx`
- Create: `web/landing/src/content/quotes.ts`
- Test: `web/landing/src/presentation/App.content.test.tsx`

**Step 1: Write the failing test**

```tsx
test('renderiza seção de configurações com itens esperados', () => {
  render(<App />);
  expect(screen.getByText(/Intervalo entre popups/i)).toBeInTheDocument();
  expect(screen.getByText(/Liturgia das Horas/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- App.content.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Adicionar conteúdo pt-BR real nas seções e citações de santos com atribuição.

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- App.content.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/content web/landing/src/presentation
git commit -m "feat(landing): add pt-BR copy, saints quotes, and settings overview"
```

### Task 8: Pipeline - gerar manifesto de downloads

**Files:**
- Create: `scripts/generate-landing-manifest.js`
- Modify: `.github/workflows/release.yml`
- Create: `tests/ci/landingManifestPipeline.test.ts`

**Step 1: Write the failing test**

```ts
test('workflow publica web/landing/public/manifest.json como artifact/site input', () => {
  const content = fs.readFileSync('.github/workflows/release.yml', 'utf8');
  expect(content).toContain('generate-landing-manifest');
  expect(content).toContain('web/landing/public/manifest.json');
});
```

**Step 2: Run test to verify it fails**

Run: `npx jest tests/ci/landingManifestPipeline.test.ts --runInBand`
Expected: FAIL.

**Step 3: Write minimal implementation**

Script lê assets publicados do release e grava:

```json
{
  "version": "2.0.3",
  "assets": {
    "windows": "https://...",
    "linux": "https://...",
    "macos": "https://..."
  },
  "fallbackUrl": "https://github.com/gabrielttavares/iacula/releases/latest"
}
```

**Step 4: Run test to verify it passes**

Run: `npx jest tests/ci/landingManifestPipeline.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/generate-landing-manifest.js .github/workflows/release.yml tests/ci/landingManifestPipeline.test.ts
git commit -m "feat(ci): generate landing download manifest from release artifacts"
```

### Task 9: Estilo visual inspirado no template e uso de assets

**Files:**
- Create: `web/landing/src/styles/tokens.css`
- Create: `web/landing/src/styles/app.css`
- Create: `web/landing/public/images/*` (selecionados de `assets/images`)
- Test: `web/landing/src/presentation/App.a11y.test.tsx`

**Step 1: Write the failing test**

```tsx
test('CTA principal é visível e acessível', () => {
  render(<App />);
  const link = screen.getByRole('link', { name: /Baixar|Ver downloads/i });
  expect(link).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `cd web/landing && npm test -- App.a11y.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Aplicar layout visual, tipografia e seções com CSS limpo, sem acoplar lógica de negócio no componente visual.

**Step 4: Run test to verify it passes**

Run: `cd web/landing && npm test -- App.a11y.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing/src/styles web/landing/public/images web/landing/src/presentation
git commit -m "feat(landing): apply visual system and assets"
```

### Task 10: Testes finais, documentação e comando de build

**Files:**
- Modify: `package.json` (scripts do módulo ou scripts raiz para build/test da landing)
- Modify: `README.md` (sessão curta da landing)
- Test: `web/landing` test suite + CI tests

**Step 1: Write the failing test**

Criar teste de integração final garantindo:
- CTA resolve download em win/linux/macos;
- fallback funciona para `unknown`.

**Step 2: Run test to verify it fails**

Run:
- `cd web/landing && npm test -- download-flow.integration.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

Ajustar wiring final em `App.tsx` para carregar manifesto e montar CTA com loading/error/fallback.

**Step 4: Run test to verify it passes**

Run:
- `cd web/landing && npm test`
- `npx jest tests/ci --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/landing package.json README.md tests/ci
git commit -m "feat(landing): finalize download flow, tests, and docs"
```
