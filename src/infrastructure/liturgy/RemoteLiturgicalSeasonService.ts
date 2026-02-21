/**
 * Infrastructure: RemoteLiturgicalSeasonService
 * Detecta a estação litúrgica consultando a API liturgia-diaria.
 * Source: https://github.com/Dancrf/liturgia-diaria
 */

import {
  ILiturgicalSeasonService,
  LiturgicalContext,
  LiturgicalRank,
  LiturgicalSeason,
} from '../../application/ports/ILiturgicalSeasonService';

interface LiturgiaDiariaResponse {
  cor?: string;
  liturgia?: string;
  antifonas?: {
    entrada?: string;
    comunhao?: string;
  };
  leituras?: {
    salmo?: Array<{ refrao?: string }>;
  };
  oracoes?: {
    coleta?: string;
    oferendas?: string;
    comunhao?: string;
  };
}

interface ContextResolution {
  context: LiturgicalContext;
  cacheable: boolean;
}

export class RemoteLiturgicalSeasonService implements ILiturgicalSeasonService {
  private static readonly REQUEST_TIMEOUT_MS = 3000;
  private static readonly FEAST_PATTERNS: Array<{ keywords: string[]; slug: string }> = [
    { keywords: ['domingo de ramos'], slug: 'palm-sunday' },
    { keywords: ['semana santa', 'ceia do senhor'], slug: 'holy-thursday' },
    { keywords: ['paixao do senhor'], slug: 'good-friday' },
    { keywords: ['vigilia pascal'], slug: 'easter-vigil' },
    { keywords: ['domingo de pascoa'], slug: 'easter-sunday' },
    { keywords: ['pentecostes'], slug: 'pentecost' },
    { keywords: ['santissima trindade'], slug: 'holy-trinity' },
    { keywords: ['corpo e sangue de cristo'], slug: 'corpus-christi' },
    { keywords: ['todos os santos'], slug: 'all-saints' },
    { keywords: ['imaculada conceicao'], slug: 'immaculate-conception' },
    { keywords: ['assuncao'], slug: 'assumption' },
    { keywords: ['sao jose'], slug: 'st-joseph' },
    { keywords: ['santos pedro e paulo'], slug: 'sts-peter-paul' },
    { keywords: ['aparecida'], slug: 'our-lady-aparecida' },
  ];

  private readonly baseUrl: string;
  private cachedContextByDate = new Map<string, LiturgicalContext>();
  private pendingRequestByDate = new Map<string, Promise<LiturgicalContext>>();

  constructor(baseUrl: string = 'https://liturgia.up.railway.app/v2') {
    this.baseUrl = baseUrl;
  }

  async getCurrentSeason(date: Date = new Date()): Promise<LiturgicalSeason> {
    const context = await this.getCurrentContext(date);
    return context.season;
  }

  async getCurrentContext(date: Date = new Date()): Promise<LiturgicalContext> {
    const dateKey = this.toDateKey(date);
    const cached = this.cachedContextByDate.get(dateKey);
    if (cached) {
      console.log(`[LiturgicalSeason] Cache hit for ${dateKey}: ${cached.season}`);
      return cached;
    }

    const pending = this.pendingRequestByDate.get(dateKey);
    if (pending) {
      return pending;
    }

    const request = this.resolveContext(date)
      .then(({ context, cacheable }) => {
        if (cacheable) {
          this.cachedContextByDate.set(dateKey, context);
        }
        return context;
      })
      .finally(() => {
        this.pendingRequestByDate.delete(dateKey);
      });

    this.pendingRequestByDate.set(dateKey, request);
    return request;
  }

  private async resolveContext(date: Date): Promise<ContextResolution> {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const url = `${this.baseUrl}/?dia=${day}&mes=${month}&ano=${year}`;

    try {
      const response = await this.fetchWithTimeout(url);
      if (!response.ok) {
        console.warn(`[LiturgicalSeason] API status ${response.status} for ${url}. Temporary fallback to ordinary (not cached).`);
        return {
          context: {
            season: 'ordinary',
            rank: 'weekday',
            apiQuotes: [],
          },
          cacheable: false,
        };
      }

      const data = await response.json() as LiturgiaDiariaResponse;
      const context = this.mapContext(data);
      console.log(`[LiturgicalSeason] API answer for ${url}: cor=${data.cor ?? 'unknown'}, liturgia=${data.liturgia ?? 'unknown'} -> mapped=${context.season}`);
      return { context, cacheable: true };
    } catch {
      console.warn(`[LiturgicalSeason] API request failed for ${url}. Temporary fallback to ordinary (not cached).`);
      return {
        context: {
          season: 'ordinary',
          rank: 'weekday',
          apiQuotes: [],
        },
        cacheable: false,
      };
    }
  }

  private mapContext(data: LiturgiaDiariaResponse): LiturgicalContext {
    const liturgiaRaw = data.liturgia ?? '';
    const normalizedLiturgia = this.normalizeText(liturgiaRaw);

    const season = this.mapSeason(data.cor, normalizedLiturgia);
    const rank = this.parseRank(normalizedLiturgia);
    const feast = this.detectFeast(normalizedLiturgia, rank);
    const feastName = feast ? this.extractFeastName(liturgiaRaw) : undefined;

    return {
      season,
      feast,
      feastName,
      rank,
      apiQuotes: this.extractApiQuotes(data),
    };
  }

  private parseRank(normalizedLiturgia: string): LiturgicalRank {
    if (normalizedLiturgia.includes('solenidade')) return 'solemnity';
    if (normalizedLiturgia.includes('festa')) return 'feast';
    if (normalizedLiturgia.includes('memoria')) return 'memorial';
    return 'weekday';
  }

  private detectFeast(normalizedLiturgia: string, rank: LiturgicalRank): string | undefined {
    for (const pattern of RemoteLiturgicalSeasonService.FEAST_PATTERNS) {
      if (pattern.keywords.every(keyword => normalizedLiturgia.includes(keyword))) {
        return pattern.slug;
      }
    }

    if (rank === 'solemnity' || rank === 'feast') {
      return this.slugify(this.extractFeastName(normalizedLiturgia));
    }

    return undefined;
  }

  private extractFeastName(liturgia: string): string {
    const normalized = this.normalizeText(liturgia)
      .replace(/,\s*(solenidade|festa|memoria)$/g, '')
      .replace(/\s*\-\s*missa vespertina da ceia do senhor/g, '')
      .replace(/^\s*5a feira da semana santa/g, 'quinta-feira santa')
      .replace(/^\s*6a feira da semana santa/g, 'sexta-feira santa')
      .trim();

    return normalized;
  }

  private extractApiQuotes(data: LiturgiaDiariaResponse): string[] {
    const candidates = [
      data.antifonas?.entrada,
      data.antifonas?.comunhao,
      data.leituras?.salmo?.[0]?.refrao,
      data.oracoes?.coleta,
      data.oracoes?.oferendas,
      data.oracoes?.comunhao,
    ];

    return candidates
      .filter((value): value is string => Boolean(value && value.trim()))
      .map(value => value.trim());
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

  private mapSeason(cor?: string, normalizedLiturgia: string = ''): LiturgicalSeason {
    const normalizedCor = this.normalizeText(cor || '');

    if (
      normalizedLiturgia.includes('semana santa') ||
      normalizedLiturgia.includes('paixao do senhor') ||
      normalizedLiturgia.includes('paixao')
    ) {
      return 'lent';
    }

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
          normalizedLiturgia.includes('pascoa') ||
          normalizedLiturgia.includes('ressurreicao') ||
          normalizedLiturgia.includes('aleluia')
        ) return 'easter';
        return 'ordinary';
      }

      default:
        return 'ordinary';
    }
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private slugify(value: string): string {
    return this.normalizeText(value)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
