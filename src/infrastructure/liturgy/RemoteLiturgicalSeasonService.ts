/**
 * Infrastructure: RemoteLiturgicalSeasonService
 * Detecta a estação litúrgica consultando fonte externa.
 */

import { ILiturgicalSeasonService, LiturgicalSeason } from '../../application/ports/ILiturgicalSeasonService';

interface ChurchCalendarDay {
  season?: string;
}

export class RemoteLiturgicalSeasonService implements ILiturgicalSeasonService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'https://calapi.inadiutorium.cz/api/v0/en/calendars/default') {
    this.baseUrl = baseUrl;
  }

  async getCurrentSeason(date: Date = new Date()): Promise<LiturgicalSeason> {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const url = `${this.baseUrl}/${year}/${month}/${day}`;

    try {
      const response = await this.fetchWithFallback(url);
      if (!response.ok) {
        return 'ordinary';
      }

      const data = await response.json() as ChurchCalendarDay;
      return this.mapSeason(data.season);
    } catch {
      return 'ordinary';
    }
  }

  private async fetchWithFallback(url: string): Promise<Response> {
    try {
      return await fetch(url);
    } catch (error) {
      const fallbackUrl = this.getHttpFallbackUrl(url);
      if (!fallbackUrl) {
        throw error;
      }

      return fetch(fallbackUrl);
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
