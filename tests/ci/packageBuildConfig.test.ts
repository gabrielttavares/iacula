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

  it('should use AppImage-only target on linux', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
      build?: { linux?: { target?: string | string[] } };
    };

    const linuxTarget = pkg.build?.linux?.target;
    if (Array.isArray(linuxTarget)) {
      expect(linuxTarget).toEqual(['AppImage']);
      return;
    }

    expect(linuxTarget).toBe('AppImage');
  });
});
