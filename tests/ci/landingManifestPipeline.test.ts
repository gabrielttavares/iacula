import fs from 'fs';
import path from 'path';

describe('landing manifest pipeline', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/release.yml');
  let workflow: string;

  beforeAll(() => {
    workflow = fs.readFileSync(workflowPath, 'utf8');
  });

  it('workflow gera manifesto da landing no caminho esperado', () => {
    expect(workflow).toContain('generate-landing-manifest');
    expect(workflow).toContain('web/landing/public/manifest.json');
  });

  it('should commit manifest back to main after generation', () => {
    expect(workflow).toContain('git push origin HEAD:main');
    expect(workflow).toContain('web/landing/public/manifest.json');
  });
});
