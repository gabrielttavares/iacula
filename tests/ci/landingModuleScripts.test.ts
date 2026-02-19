import fs from 'fs';
import path from 'path';

describe('landing module scripts', () => {
  it('exposes scripts to run landing module from repository root', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(pkg.scripts?.['landing:dev']).toBeDefined();
    expect(pkg.scripts?.['landing:build']).toBeDefined();
    expect(pkg.scripts?.['landing:test']).toBeDefined();
  });
});
