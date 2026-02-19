import fs from 'fs';
import path from 'path';

describe('release workflow', () => {
  it('should not include macOS build jobs while notarization is deferred', () => {
    const workflowPath = path.join(process.cwd(), '.github/workflows/release.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');

    expect(content).not.toContain('name: macos-x64');
    expect(content).not.toContain('name: macos-arm64');
    expect(content).not.toContain('runs-on: macos-latest');
    expect(content).not.toContain('latest-mac.yml');
    expect(content).not.toContain('*.dmg');
  });

  it('should build Linux as AppImage only', () => {
    const workflowPath = path.join(process.cwd(), '.github/workflows/release.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');

    expect(content).toContain('build_args: --linux AppImage');
    expect(content).not.toContain('build_args: --linux deb');
  });

  it('should publish Linux AppImage updater artifacts and no deb artifacts', () => {
    const workflowPath = path.join(process.cwd(), '.github/workflows/release.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');

    expect(content).toContain('release-artifacts/*.AppImage');
    expect(content).toContain('release-artifacts/latest-linux.yml');
    expect(content).not.toContain('release-artifacts/*.deb');
  });
});
