/**
 * Port: ILiturgicalSeasonService
 * Detecta a estação litúrgica atual.
 */

export type LiturgicalSeason = 'ordinary' | 'advent' | 'lent' | 'easter' | 'christmas';

export interface ILiturgicalSeasonService {
  getCurrentSeason(date?: Date): Promise<LiturgicalSeason>;
}
