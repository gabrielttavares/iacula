/**
 * Infrastructure: RemoteLiturgicalSeasonService
 * Detecta a estação litúrgica consultando fonte externa.
 */

import { ILiturgicalSeasonService, LiturgicalSeason } from '../../application/ports/ILiturgicalSeasonService';

interface ChurchCalendarDay {
  season?: string;
}

export class RemoteLiturgicalSeasonService implements ILiturgicalSeasonService {
  private static readonly REQUEST_TIMEOUT_MS = 1500;
  private readonly baseUrl: string;
  private cachedSeasonByDate = new Map<string, LiturgicalSeason>();
  private pendingRequestByDate = new Map<string, Promise<LiturgicalSeason>>();

  constructor(baseUrl: string = 'https://calapi.inadiutorium.cz/api/v0/en/calendars/default') {
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
      .then((season) => {
        this.cachedSeasonByDate.set(dateKey, season);
        return season;
      })
      .finally(() => {
        this.pendingRequestByDate.delete(dateKey);
      });

    this.pendingRequestByDate.set(dateKey, request);
    return request;
  }

  private async resolveSeason(date: Date): Promise<LiturgicalSeason> {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const url = `${this.baseUrl}/${year}/${month}/${day}`;

    try {
      const response = await this.fetchWithFallback(url);
      if (!response.ok) {
        console.warn(`[LiturgicalSeason] API status ${response.status} for ${url}. Falling back to ordinary.`);
        return 'ordinary';
      }

      const data = await response.json() as ChurchCalendarDay;
      const mappedSeason = this.mapSeason(data.season);
      console.log(`[LiturgicalSeason] API answer for ${url}: season=${data.season ?? 'unknown'} -> mapped=${mappedSeason}`);
      return mappedSeason;
    } catch {
      console.warn(`[LiturgicalSeason] API request failed for ${url}. Falling back to ordinary.`);
      return 'ordinary';
    }
  }

  private toDateKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async fetchWithFallback(url: string): Promise<Response> {
    try {
      console.log(`[LiturgicalSeason] Fetching API via HTTPS: ${url}`);
      return await this.fetchWithTimeout(url);
    } catch (error) {
      const fallbackUrl = this.getHttpFallbackUrl(url);
      if (!fallbackUrl) {
        throw error;
      }

      console.warn(`[LiturgicalSeason] HTTPS failed. Retrying via HTTP: ${fallbackUrl}`);
      return this.fetchWithTimeout(fallbackUrl);
    }
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

  private getHttpFallbackUrl(url: string): string | null {
    if (!url.startsWith('https://')) {
      return null;
    }

    try {
      const parsed = new URL(url);
      if (parsed.hostname !== 'calapi.inadiutorium.cz') {
        return null;
      }

      parsed.protocol = 'http:';
      return parsed.toString();
    } catch {
      return null;
    }
  }

  private mapSeason(remoteSeason?: string): LiturgicalSeason {
    const normalized = (remoteSeason || '').toLowerCase();

    switch (normalized) {
      case 'advent':
        return 'advent';
      case 'lent':
        return 'lent';
      case 'easter':
        return 'easter';
      case 'christmas':
        return 'christmas';
      case 'ordinary':
      default:
        return 'ordinary';
    }
  }
}
