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

  it('should map lent season for Holy Week text even with red color', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Vermelho', liturgia: '6a feira da Semana Santa - Paixao do Senhor' }),
    });

    const season = await service.getCurrentSeason(new Date('2026-04-03T12:00:00Z'));
    expect(season).toBe('lent');
  });

  it('should parse rank, feast and api quotes from context', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        cor: 'Vermelho',
        liturgia: 'Domingo de Pentecostes, Solenidade',
        antifonas: { entrada: 'O Espirito do Senhor encheu o universo.' },
        leituras: { salmo: [{ refrao: 'Enviai o vosso Espirito, Senhor.' }] },
        oracoes: { coleta: 'Concedei-nos, Senhor...' },
      }),
    });

    const context = await service.getCurrentContext(new Date('2026-05-24T12:00:00Z'));

    expect(context.rank).toBe('solemnity');
    expect(context.feast).toBe('pentecost');
    expect(context.feastName).toBe('domingo de pentecostes');
    expect(context.apiQuotes).toEqual([
      'O Espirito do Senhor encheu o universo.',
      'Enviai o vosso Espirito, Senhor.',
      'Concedei-nos, Senhor...',
    ]);
  });

  it('should normalize manifest slug to canonical slug for pentecost', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        cor: 'Vermelho',
        liturgia: 'Domingo de Pentecostes, Solenidade',
      }),
    });

    const context = await service.getCurrentContext(new Date('2026-05-24T12:00:00Z'));
    expect(context.feast).toBe('pentecost');
  });

  it('should normalize long Sao Jose feast slug to canonical st-joseph', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        cor: 'Branco',
        liturgia: 'São José, Esposo da Bem-Aventurada Virgem Maria, Solenidade',
      }),
    });

    const context = await service.getCurrentContext(new Date('2026-03-19T12:00:00Z'));
    expect(context.feast).toBe('st-joseph');
  });

  it('should fallback to ordinary weekday context when remote fails', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    const context = await service.getCurrentContext(new Date(2026, 7, 10, 12, 0, 0));
    expect(context).toEqual({
      season: 'ordinary',
      rank: 'weekday',
      apiQuotes: [],
    });
  });

  it('should not cache fallback context when remote fails temporarily', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cor: 'Roxo', liturgia: '1a Semana da Quaresma' }),
      });

    const date = new Date(2026, 1, 18, 12, 0, 0);
    const first = await service.getCurrentContext(date);
    const second = await service.getCurrentContext(date);

    expect(first.season).toBe('ordinary');
    expect(second.season).toBe('lent');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should use cached context for repeated calls on same date', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ cor: 'Roxo', liturgia: '2o Domingo do Advento' }),
    });

    const date = new Date(2026, 11, 10, 12, 0, 0);
    const first = await service.getCurrentContext(date);
    const second = await service.getCurrentContext(date);

    expect(first.season).toBe('advent');
    expect(second.season).toBe('advent');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
