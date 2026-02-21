/**
 * DTO: QuoteDTO
 * Data Transfer Object para citações/jaculatórias.
 */
import { LiturgicalSeason } from '../ports/ILiturgicalSeasonService';

export interface QuoteDTO {
  text: string;
  imagePath: string | null;
  dayOfWeek: number;
  theme: string;
  season: LiturgicalSeason;
  feast?: string;
  feastName?: string;
}
