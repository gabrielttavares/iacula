/**
 * DTO: QuoteDTO
 * Data Transfer Object para citações/jaculatórias.
 */

export interface QuoteDTO {
  text: string;
  imagePath: string | null;
  dayOfWeek: number;
  theme: string;
}
