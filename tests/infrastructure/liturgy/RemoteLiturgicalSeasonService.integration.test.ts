import { RemoteLiturgicalSeasonService } from '../../../src/infrastructure/liturgy/RemoteLiturgicalSeasonService';

const describeIntegration = process.env.RUN_LITURGY_API_TESTS ? describe : describe.skip;

describeIntegration('RemoteLiturgicalSeasonService Integration (real API)', () => {
  const service = new RemoteLiturgicalSeasonService();
  jest.setTimeout(15000);

  async function assertRealApiSeason(date: Date, expectedSeason: 'lent' | 'christmas' | 'easter'): Promise<void> {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const httpsUrl = `https://calapi.inadiutorium.cz/api/v0/en/calendars/default/${year}/${month}/${day}`;
    const httpUrl = `http://calapi.inadiutorium.cz/api/v0/en/calendars/default/${year}/${month}/${day}`;

    let response: Response;
    try {
      response = await fetch(httpsUrl);
    } catch {
      response = await fetch(httpUrl);
    }

    if (!response.ok) {
      throw new Error(`Liturgical API unavailable: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json() as { season?: string };
    expect((payload.season || '').toLowerCase()).toBe(expectedSeason);

    const season = await service.getCurrentSeason(date);
    expect(season).toBe(expectedSeason);
  }

  it('should return lent on Ash Wednesday (2026-02-18)', async () => {
    await assertRealApiSeason(new Date('2026-02-18T12:00:00Z'), 'lent');
  });

  it('should return christmas on Christmas day (2026-12-25)', async () => {
    await assertRealApiSeason(new Date('2026-12-25T12:00:00Z'), 'christmas');
  });

  it('should return easter on Easter Sunday (2026-04-05)', async () => {
    await assertRealApiSeason(new Date('2026-04-05T12:00:00Z'), 'easter');
  });
});
