import fs from 'fs';
import path from 'path';

describe('package build config for updater', () => {
  it('should include electron-updater dependency', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
      dependencies?: Record<string, string>;
    };

    expect(pkg.dependencies).toBeDefined();
    expect(pkg.dependencies?.['electron-updater']).toBeDefined();
  });

  it('should build AppImage and rpm targets on linux (no deb)', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
      build?: { linux?: { target?: string | string[] } };
    };

    const linuxTarget = pkg.build?.linux?.target;
    expect(linuxTarget).toEqual(['AppImage', 'rpm']);
  });
});
