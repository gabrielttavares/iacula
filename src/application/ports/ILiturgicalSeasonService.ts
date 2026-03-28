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
}

/** Igual ao contexto temporário quando a API litúrgica falha (Tempo Comum, dia da semana). */
export const ORDINARY_WEEKDAY_FALLBACK_CONTEXT: LiturgicalContext = {
  season: 'ordinary',
  rank: 'weekday',
};

export interface ILiturgicalSeasonService {
  getCurrentSeason(date?: Date): Promise<LiturgicalSeason>;
  getCurrentContext(date?: Date): Promise<LiturgicalContext>;
}
