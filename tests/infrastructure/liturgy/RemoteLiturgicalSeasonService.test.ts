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
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/calendar/2026/12/10',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
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

  it('should fallback to http when https call fails for calapi host', async () => {
    const networkError = Object.assign(new Error('connect failed'), {
      cause: { code: 'ECONNREFUSED' },
    });

    fetchMock
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ season: 'lent' }),
      });

    const calapiService = new RemoteLiturgicalSeasonService('https://calapi.inadiutorium.cz/api/v0/en/calendars/default');
    const season = await calapiService.getCurrentSeason(new Date('2026-02-18T12:00:00Z'));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://calapi.inadiutorium.cz/api/v0/en/calendars/default/2026/02/18',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://calapi.inadiutorium.cz/api/v0/en/calendars/default/2026/02/18',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
    expect(season).toBe('lent');
  });

  it('should use cached season for repeated calls on same date', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ season: 'advent' }),
    });

    const date = new Date('2026-12-10T12:00:00Z');
    const first = await service.getCurrentSeason(date);
    const second = await service.getCurrentSeason(date);

    expect(first).toBe('advent');
    expect(second).toBe('advent');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should fetch again when date changes', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ season: 'advent' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ season: 'christmas' }),
      });

    const first = await service.getCurrentSeason(new Date('2026-12-10T12:00:00Z'));
    const second = await service.getCurrentSeason(new Date('2026-12-25T12:00:00Z'));

    expect(first).toBe('advent');
    expect(second).toBe('christmas');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
