/**
 * Port: IAssetService
 * Interface para acesso aos assets (imagens, JSONs de orações/citações).
 * A implementação concreta fica na camada de infraestrutura.
 */

import { QuotesCollection } from '../../domain/entities/Quote';
import { PrayerCollection } from '../../domain/entities/Prayer';
import { LiturgicalSeason } from './ILiturgicalSeasonService';

export interface IAssetService {
  /**
   * Carrega a coleção de citações para um idioma específico.
   */
  loadQuotes(language: string, season?: LiturgicalSeason): Promise<QuotesCollection>;

  /**
   * Carrega a coleção de orações para um idioma específico.
   */
  loadPrayers(language: string): Promise<PrayerCollection>;

  /**
   * Obtém o caminho absoluto para uma imagem do dia.
   */
  getImagePath(dayOfWeek: number, season?: LiturgicalSeason): Promise<string | null>;

  /**
   * Lista todas as imagens disponíveis para um dia.
   */
  listDayImages(dayOfWeek: number, season?: LiturgicalSeason): Promise<string[]>;

  /**
   * Obtém o caminho da imagem do Angelus.
   */
  getAngelusImagePath(): Promise<string>;

  /**
   * Obtém o caminho da imagem da Regina Caeli.
   */
  getReginaCaeliImagePath(): Promise<string>;
}
