import { RemoteLiturgicalSeasonService } from '../../../src/infrastructure/liturgy/RemoteLiturgicalSeasonService';

describe('RemoteLiturgicalSeasonService', () => {
  let service: RemoteLiturgicalSeasonService;
  const fetchMock = jest.fn();

  beforeEach(() => {
    service = new RemoteLiturgicalSeasonService('https://example.com/v2');
    fetchMock.mockReset();
    (global as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;
  });

  it('should map advent season when cor is Roxo and liturgia mentions Advento', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Roxo', liturgia: '1o Domingo do Advento' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-12-10T12:00:00Z'));

    expect(season).toBe('advent');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/v2/?dia=10&mes=12&ano=2026',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
  });

  it('should map lent season when cor is Roxo without Advento', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Roxo', liturgia: 'Quarta-feira de Cinzas' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-02-18T12:00:00Z'));
    expect(season).toBe('lent');
  });

  it('should map advent when cor is Rosa and liturgia mentions Advento (Gaudete)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Rosa', liturgia: '3o Domingo do Advento' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-12-13T12:00:00Z'));
    expect(season).toBe('advent');
  });

  it('should map lent when cor is Rosa without Advento (Laetare)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Rosa', liturgia: '4o Domingo da Quaresma' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-03-22T12:00:00Z'));
    expect(season).toBe('lent');
  });

  it('should map easter season when cor is Branco and liturgia mentions Pascoa', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Branco', liturgia: 'Domingo de Páscoa' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-04-05T12:00:00Z'));
    expect(season).toBe('easter');
  });

  it('should map christmas season when cor is Branco and liturgia mentions Natal', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Branco', liturgia: 'Natal do Senhor' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-12-25T12:00:00Z'));
    expect(season).toBe('christmas');
  });

  it('should map ordinary when cor is Branco without seasonal keywords', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Branco', liturgia: 'Festa de Nossa Senhora' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-08-15T12:00:00Z'));
    expect(season).toBe('ordinary');
  });

  it('should map ordinary when cor is Verde', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Verde', liturgia: '10o Domingo do Tempo Comum' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-06-14T12:00:00Z'));
    expect(season).toBe('ordinary');
  });

  it('should map ordinary when cor is Vermelho', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Vermelho', liturgia: 'Domingo de Pentecostes' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-05-24T12:00:00Z'));
    expect(season).toBe('ordinary');
  });

  it('should fallback to ordinary when remote fails', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    const season = await service.getCurrentSeason(new Date(2026, 7, 10, 12, 0, 0));
    expect(season).toBe('ordinary');
  });

  it('should not cache ordinary fallback when remote fails temporarily', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cor: 'Roxo', liturgia: '1a Semana da Quaresma' }),
      });

    const date = new Date(2026, 1, 18, 12, 0, 0);
    const first = await service.getCurrentSeason(date);
    const second = await service.getCurrentSeason(date);

    expect(first).toBe('ordinary');
    expect(second).toBe('lent');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should use cached season for repeated calls on same date', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Roxo', liturgia: '2o Domingo do Advento' }),
    });

    const date = new Date(2026, 11, 10, 12, 0, 0);
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
        json: async () => ({ cor: 'Roxo', liturgia: '2o Domingo do Advento' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cor: 'Branco', liturgia: 'Natal do Senhor' }),
      });

    const first = await service.getCurrentSeason(new Date(2026, 11, 10, 12, 0, 0));
    const second = await service.getCurrentSeason(new Date(2026, 11, 25, 12, 0, 0));

    expect(first).toBe('advent');
    expect(second).toBe('christmas');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
