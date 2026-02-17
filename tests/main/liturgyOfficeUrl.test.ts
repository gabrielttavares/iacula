import { buildIbreviaryOfficeUrl } from '../../src/main/liturgyOfficeUrl';

function expectIbreviaryUrl(urlString: string, expectedOffice: string): void {
  const url = new URL(urlString);
  expect(`${url.origin}${url.pathname}`).toBe('https://www.ibreviary.com/m2/breviario.php');
  expect(url.searchParams.get('lang')).toBe('pt');
  expect(url.searchParams.get('s')).toBe(expectedOffice);
}

describe('buildIbreviaryOfficeUrl', () => {
  it('builds laudes URL in Portuguese', () => {
    expectIbreviaryUrl(buildIbreviaryOfficeUrl('laudes'), 'lodi');
  });

  it('builds vespers URL in Portuguese', () => {
    expectIbreviaryUrl(buildIbreviaryOfficeUrl('vespers'), 'vespri');
  });

  it('builds compline URL in Portuguese', () => {
    expectIbreviaryUrl(buildIbreviaryOfficeUrl('compline'), 'compieta');
  });

  it('builds ora media URL in Portuguese', () => {
    expectIbreviaryUrl(buildIbreviaryOfficeUrl('ora_media'), 'ora_media');
  });

  it('falls back to laudes office for unknown module and keeps Portuguese', () => {
    expectIbreviaryUrl(buildIbreviaryOfficeUrl('unknown'), 'lodi');
  });
});
