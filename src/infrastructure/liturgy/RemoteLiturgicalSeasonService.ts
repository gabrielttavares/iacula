/**
 * Infrastructure: RemoteLiturgicalSeasonService
 * Detecta a estação litúrgica consultando a API liturgia-diaria.
 * Source: https://github.com/Dancrf/liturgia-diaria
 */

import { ILiturgicalSeasonService, LiturgicalSeason } from '../../application/ports/ILiturgicalSeasonService';

interface LiturgiaDiariaResponse {
  cor?: string;
  liturgia?: string;
}

interface SeasonResolution {
  season: LiturgicalSeason;
  cacheable: boolean;
}

export class RemoteLiturgicalSeasonService implements ILiturgicalSeasonService {
  private static readonly REQUEST_TIMEOUT_MS = 3000;
  private readonly baseUrl: string;
  private cachedSeasonByDate = new Map<string, LiturgicalSeason>();
  private pendingRequestByDate = new Map<string, Promise<LiturgicalSeason>>();

  constructor(baseUrl: string = 'https://liturgia.up.railway.app/v2') {
    this.baseUrl = baseUrl;
  }

  async getCurrentSeason(date: Date = new Date()): Promise<LiturgicalSeason> {
    const dateKey = this.toDateKey(date);
    const cached = this.cachedSeasonByDate.get(dateKey);
    if (cached) {
      console.log(`[LiturgicalSeason] Cache hit for ${dateKey}: ${cached}`);
      return cached;
    }

    const pending = this.pendingRequestByDate.get(dateKey);
    if (pending) {
      return pending;
    }

    const request = this.resolveSeason(date)
      .then(({ season, cacheable }) => {
        if (cacheable) {
          this.cachedSeasonByDate.set(dateKey, season);
        }
        return season;
      })
      .finally(() => {
        this.pendingRequestByDate.delete(dateKey);
      });

    this.pendingRequestByDate.set(dateKey, request);
    return request;
  }

  private async resolveSeason(date: Date): Promise<SeasonResolution> {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const url = `${this.baseUrl}/?dia=${day}&mes=${month}&ano=${year}`;

    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) {
        console.warn(`[LiturgicalSeason] API status ${response.status} for ${url}. Temporary fallback to ordinary (not cached).`);
        return { season: 'ordinary', cacheable: false };
      }

      const data = await response.json() as LiturgiaDiariaResponse;
      const mappedSeason = this.mapSeason(data.cor, data.liturgia);
      console.log(`[LiturgicalSeason] API answer for ${url}: cor=${data.cor ?? 'unknown'}, liturgia=${data.liturgia ?? 'unknown'} -> mapped=${mappedSeason}`);
      return { season: mappedSeason, cacheable: true };
    } catch {
      console.warn(`[LiturgicalSeason] API request failed for ${url}. Temporary fallback to ordinary (not cached).`);
      return { season: 'ordinary', cacheable: false };
    }
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RemoteLiturgicalSeasonService.REQUEST_TIMEOUT_MS);

    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private mapSeason(cor?: string, liturgia?: string): LiturgicalSeason {
    const normalizedCor = (cor || '').toLowerCase();
    const normalizedLiturgia = (liturgia || '').toLowerCase();

    switch (normalizedCor) {
      case 'verde':
      case 'vermelho':
        return 'ordinary';

      case 'roxo':
      case 'rosa':
        return normalizedLiturgia.includes('advento') ? 'advent' : 'lent';

      case 'branco': {
        if (normalizedLiturgia.includes('natal')) return 'christmas';
        if (
          normalizedLiturgia.includes('páscoa') ||
          normalizedLiturgia.includes('pascoa') ||
          normalizedLiturgia.includes('ressurreição') ||
          normalizedLiturgia.includes('ressurreicao') ||
          normalizedLiturgia.includes('aleluia')
        ) return 'easter';
        return 'ordinary';
      }

      default:
        return 'ordinary';
    }
  }
}
