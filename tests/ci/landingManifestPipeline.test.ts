import fs from 'fs';
import path from 'path';

describe('landing manifest pipeline', () => {
  it('workflow gera manifesto da landing no caminho esperado', () => {
    const workflowPath = path.join(process.cwd(), '.github/workflows/release.yml');
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    expect(workflow).toContain('generate-landing-manifest');
    expect(workflow).toContain('web/landing/public/manifest.json');
  });
});
