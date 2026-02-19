import fs from 'fs';
import path from 'path';

describe('landing Vercel preview workflow', () => {
  const workflowPath = path.join(
    process.cwd(),
    '.github/workflows/landing-vercel-preview.yml',
  );
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(workflowPath, 'utf8');
  });

  it('should trigger only on main branch', () => {
    expect(content).toContain('branches: [main]');
  });

  it('should scope trigger to landing page paths only', () => {
    expect(content).toContain('web/landing/**');
  });

  it('should support manual dispatch', () => {
    expect(content).toContain('workflow_dispatch');
  });

  it('should deploy as preview, not production', () => {
    expect(content).toContain('vercel deploy --prebuilt');
    expect(content).not.toContain('--prod');
  });

  it('should require Vercel secrets', () => {
    expect(content).toContain('secrets.VERCEL_TOKEN');
    expect(content).toContain('secrets.VERCEL_ORG_ID');
    expect(content).toContain('secrets.VERCEL_PROJECT_ID');
  });

  it('should install dependencies with frozen lockfile', () => {
    expect(content).toContain('--frozen-lockfile');
  });

  it('should build landing page before deploying', () => {
    expect(content).toContain('pnpm --dir web/landing build');
  });
});
