import { RemoteLiturgicalSeasonService } from '../../../src/infrastructure/liturgy/RemoteLiturgicalSeasonService';

describe('RemoteLiturgicalSeasonService', () => {
  let service: RemoteLiturgicalSeasonService;
  const fetchMock = jest.fn();

  beforeEach(() => {
    service = new RemoteLiturgicalSeasonService('https://example.com/calendar');
    fetchMock.mockReset();
    (global as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;
  });

  it('should map advent season from remote api', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ season: 'advent' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-12-10T12:00:00Z'));

    expect(season).toBe('advent');
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/calendar/2026/12/10');
  });

  it('should map lent season from remote api', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ season: 'lent' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-03-15T12:00:00Z'));
    expect(season).toBe('lent');
  });

  it('should map easter season from remote api', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ season: 'easter' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-04-12T12:00:00Z'));
    expect(season).toBe('easter');
  });

  it('should map christmas season from remote api', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ season: 'christmas' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-12-25T12:00:00Z'));
    expect(season).toBe('christmas');
  });

  it('should fallback to ordinary when remote fails', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    const season = await service.getCurrentSeason(new Date('2026-08-10T12:00:00Z'));
    expect(season).toBe('ordinary');
  });
});
