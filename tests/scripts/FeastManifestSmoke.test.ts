import fs from 'fs';
import path from 'path';

describe('Feast manifest smoke check', () => {
  const root = process.cwd();
  const manifestPath = path.join(root, 'docs', 'feasts-manifest-2026.json');
  const imagesDir = path.join(root, 'assets', 'images', 'feasts');
  const quotesDir = path.join(root, 'assets', 'quotes', 'pt-br', 'feasts');

  it('should include canonicalSlug and scaffold canonical assets', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Array<{
      slug: string;
      canonicalSlug?: string;
    }>;

    expect(manifest.length).toBeGreaterThan(0);

    const canonicalSlugs = new Set<string>();
    for (const entry of manifest) {
      expect(entry.slug).toBeTruthy();
      expect(entry.canonicalSlug).toBeTruthy();
      canonicalSlugs.add(entry.canonicalSlug as string);
    }

    for (const slug of canonicalSlugs) {
      const imagePath = path.join(imagesDir, slug);
      const quotePath = path.join(quotesDir, `${slug}.json`);
      expect(fs.existsSync(imagePath)).toBe(true);
      expect(fs.existsSync(quotePath)).toBe(true);
    }
  });
});
