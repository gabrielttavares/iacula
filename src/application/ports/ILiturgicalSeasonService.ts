/**
 * Port: ILiturgicalSeasonService
 * Detecta a estação litúrgica atual.
 */

export type LiturgicalSeason = 'ordinary' | 'advent' | 'lent' | 'easter' | 'christmas';
export type LiturgicalRank = 'solemnity' | 'feast' | 'memorial' | 'weekday';

export interface LiturgicalContext {
  season: LiturgicalSeason;
  feast?: string;
  feastName?: string;
  rank: LiturgicalRank;
  apiQuotes: string[];
}

export interface ILiturgicalSeasonService {
  getCurrentSeason(date?: Date): Promise<LiturgicalSeason>;
  getCurrentContext(date?: Date): Promise<LiturgicalContext>;
}
